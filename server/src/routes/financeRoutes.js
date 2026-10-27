import express from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET /api/finance/invoices - Invoices with role check & client isolation
router.get('/invoices', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    let where = {};

    if (user.role === 'CLIENT') {
      const client = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
      if (!client) return res.json({ success: true, invoices: [] });
      where.clientId = client.id;
    } else if (!['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER'].includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Access denied to financial records.' });
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true, gstin: true, address: true } },
        items: true,
        payments: { orderBy: { paymentDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
});

// POST /api/finance/invoices - Create Invoice with Line Items
router.post('/invoices', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER'), async (req, res, next) => {
  try {
    const { clientId, dueDate, items, discount = 0, taxRate = 18, notes } = req.body;

    if (!clientId || !items || !items.length) {
      return res.status(400).json({ success: false, error: 'Client and at least one line item are required.' });
    }

    // Decimal arithmetic for accounting accuracy
    let subtotal = 0;
    const computedItems = items.map((item) => {
      const qty = parseInt(item.quantity) || 1;
      const unit = parseFloat(item.unitPrice) || 0;
      const amount = qty * unit;
      subtotal += amount;
      return {
        description: item.description,
        quantity: qty,
        unitPrice: unit,
        amount,
      };
    });

    const disc = parseFloat(discount) || 0;
    const taxable = Math.max(0, subtotal - disc);
    const tax = taxable * ((parseFloat(taxRate) || 18) / 100);
    const total = taxable + tax;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          clientId,
          createdById: req.user.id,
          status: 'ISSUED',
          dueDate: new Date(dueDate || Date.now() + 30 * 86400000),
          subtotal,
          discount: disc,
          taxRate: parseFloat(taxRate) || 18,
          taxAmount: tax,
          totalAmount: total,
          balanceDue: total,
          notes,
          items: {
            create: computedItems,
          },
        },
        include: { items: true, client: true },
      });

      // Post double-entry journal entry: Debit Accounts Receivable (1100), Credit Revenue (4000) & GST Payable (2100)
      const arAcc = await tx.account.findUnique({ where: { code: '1100' } });
      const revAcc = await tx.account.findUnique({ where: { code: '4000' } });
      const taxAcc = await tx.account.findUnique({ where: { code: '2100' } });

      if (arAcc && revAcc) {
        await tx.journalEntry.create({
          data: {
            entryNumber: `JE-INV-${inv.invoiceNumber}`,
            description: `Invoice Issuance ${inv.invoiceNumber}`,
            reference: inv.invoiceNumber,
            lines: {
              create: [
                { accountId: arAcc.id, debit: total, credit: 0 },
                { accountId: revAcc.id, debit: 0, credit: taxable },
                ...(tax > 0 && taxAcc ? [{ accountId: taxAcc.id, debit: 0, credit: tax }] : []),
              ],
            },
          },
        });
      }

      return inv;
    });

    await logAudit({
      userId: req.user.id,
      action: 'INVOICE_CREATED',
      entity: 'Invoice',
      entityId: invoice.id,
      details: { invoiceNumber: invoice.invoiceNumber, totalAmount: total },
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
});

// POST /api/finance/invoices/:id/payments - Record Payment Transaction
router.post('/invoices/:id/payments', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionRef, notes } = req.body;
    const paymentVal = parseFloat(amount);

    if (!paymentVal || paymentVal <= 0) {
      return res.status(400).json({ success: false, error: 'A positive payment amount is required.' });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found.' });

    const currentBalance = parseFloat(invoice.balanceDue);
    if (paymentVal > currentBalance) {
      return res.status(400).json({ success: false, error: `Payment (Rs. ${paymentVal}) exceeds remaining balance of Rs. ${currentBalance}.` });
    }

    const receiptNumber = `RCP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          receiptNumber,
          invoiceId: id,
          recordedById: req.user.id,
          amount: paymentVal,
          paymentMethod: paymentMethod || 'BANK_TRANSFER',
          transactionRef,
          notes,
        },
      });

      const newPaid = parseFloat(invoice.paidAmount) + paymentVal;
      const newBalance = currentBalance - paymentVal;
      const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';

      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          paidAmount: newPaid,
          balanceDue: newBalance,
          status: newStatus,
        },
      });

      // Post balanced journal entry: Debit Cash/Bank (1000), Credit Accounts Receivable (1100)
      const cashAcc = await tx.account.findUnique({ where: { code: '1000' } });
      const arAcc = await tx.account.findUnique({ where: { code: '1100' } });

      if (cashAcc && arAcc) {
        await tx.journalEntry.create({
          data: {
            entryNumber: `JE-PAY-${payment.receiptNumber}`,
            description: `Payment Receipt ${payment.receiptNumber} for ${invoice.invoiceNumber}`,
            reference: payment.receiptNumber,
            lines: {
              create: [
                { accountId: cashAcc.id, debit: paymentVal, credit: 0 },
                { accountId: arAcc.id, debit: 0, credit: paymentVal },
              ],
            },
          },
        });
      }

      return { payment, invoice: updatedInvoice };
    });

    await logAudit({
      userId: req.user.id,
      action: 'PAYMENT_RECORDED',
      entity: 'Payment',
      entityId: result.payment.id,
      details: { receiptNumber, amount: paymentVal, invoiceId: id },
    });

    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// GET /api/finance/invoices/:id/pdf - Stream Real PDF Invoice
router.get('/invoices/:id/pdf', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true, items: true, payments: true },
    });

    if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found.' });

    // Client isolation check
    if (user.role === 'CLIENT' && invoice.client.userId !== user.id) {
      return res.status(403).json({ success: false, error: 'Access denied to this invoice.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Invoice-${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(22).text('IMAGINATION2SOFTWARE', { align: 'left' });
    doc.fontSize(10).text('Enterprise Software & Technology Solutions', { align: 'left' });
    doc.text('Email: contact@imagination2software.com | Web: www.imagination2software.com');
    doc.moveDown();

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 115).lineTo(550, 115).stroke();
    doc.moveDown(1.5);

    // Invoice Meta
    doc.fontSize(16).text('TAX INVOICE', { align: 'right' });
    doc.fontSize(10).text(`Invoice No: ${invoice.invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${invoice.issueDate.toISOString().slice(0, 10)}`, { align: 'right' });
    doc.text(`Due Date: ${invoice.dueDate.toISOString().slice(0, 10)}`, { align: 'right' });
    doc.text(`Status: ${invoice.status}`, { align: 'right' });

    doc.moveUp(4);
    doc.fontSize(12).text('Billed To:');
    doc.fontSize(10).text(invoice.client.companyName);
    if (invoice.client.gstin) doc.text(`GSTIN: ${invoice.client.gstin}`);
    if (invoice.client.address) doc.text(invoice.client.address);
    if (invoice.client.city) doc.text(invoice.client.city);

    doc.moveDown(2);

    // Line items table
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item Description', 50, doc.y, { width: 260 });
    doc.text('Qty', 320, doc.y, { width: 40, align: 'center' });
    doc.text('Rate', 380, doc.y, { width: 80, align: 'right' });
    doc.text('Amount (INR)', 470, doc.y, { width: 80, align: 'right' });
    doc.font('Helvetica');

    doc.moveDown(0.5);
    doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    for (const item of invoice.items) {
      const y = doc.y;
      doc.text(item.description, 50, y, { width: 260 });
      doc.text(item.quantity.toString(), 320, y, { width: 40, align: 'center' });
      doc.text(parseFloat(item.unitPrice).toFixed(2), 380, y, { width: 80, align: 'right' });
      doc.text(parseFloat(item.amount).toFixed(2), 470, y, { width: 80, align: 'right' });
      doc.moveDown(0.5);
    }

    doc.moveDown();
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(350, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Totals
    const rightAlign = { width: 170, align: 'right' };
    doc.text(`Subtotal: Rs. ${parseFloat(invoice.subtotal).toFixed(2)}`, 380, doc.y, rightAlign);
    if (parseFloat(invoice.discount) > 0) {
      doc.text(`Discount: -Rs. ${parseFloat(invoice.discount).toFixed(2)}`, 380, doc.y, rightAlign);
    }
    doc.text(`GST (${parseFloat(invoice.taxRate)}%): Rs. ${parseFloat(invoice.taxAmount).toFixed(2)}`, 380, doc.y, rightAlign);
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text(`Total Amount: Rs. ${parseFloat(invoice.totalAmount).toFixed(2)}`, 380, doc.y, rightAlign);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Paid to Date: Rs. ${parseFloat(invoice.paidAmount).toFixed(2)}`, 380, doc.y, rightAlign);
    doc.text(`Balance Outstanding: Rs. ${parseFloat(invoice.balanceDue).toFixed(2)}`, 380, doc.y, rightAlign);

    doc.moveDown(3);
    doc.fontSize(9).text('Payment Instructions: Remit wire transfer via RTGS/NEFT to Imagination2Software corporate account.', { align: 'center' });

    doc.end();
  } catch (err) {
    next(err);
  }
});

// GET /api/finance/reports - Profit & Loss, Trial Balance & Ledger summary
router.get('/reports', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER'), async (req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        journalLines: true,
      },
    });

    // Compute live balances from double-entry journal lines
    let totalRevenue = 0;
    let totalExpenses = 0;

    const trialBalance = accounts.map((acc) => {
      let totalDebit = 0;
      let totalCredit = 0;
      acc.journalLines.forEach((line) => {
        totalDebit += parseFloat(line.debit);
        totalCredit += parseFloat(line.credit);
      });

      let netBalance = 0;
      if (['ASSET', 'EXPENSE'].includes(acc.type)) {
        netBalance = totalDebit - totalCredit;
      } else {
        netBalance = totalCredit - totalDebit;
      }

      if (acc.type === 'REVENUE') totalRevenue += netBalance;
      if (acc.type === 'EXPENSE') totalExpenses += netBalance;

      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit: totalDebit,
        credit: totalCredit,
        balance: netBalance,
      };
    });

    const netProfit = totalRevenue - totalExpenses;

    res.json({
      success: true,
      trialBalance,
      profitLoss: {
        totalRevenue,
        totalExpenses,
        netProfit,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
