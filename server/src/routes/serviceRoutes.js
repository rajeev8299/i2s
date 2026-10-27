import express from 'express';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// -------------------------------------------------------------
// 1. GET /api/services - Public / Client Catalog of Active Services
// -------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const where = { isActive: true };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const services = await prisma.serviceCatalog.findMany({
      where,
      orderBy: [{ category: 'asc' }, { basePrice: 'asc' }],
    });

    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 2. GET /api/services/admin - Full Service Catalog (Admin Management)
// -------------------------------------------------------------
router.get('/admin', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const services = await prisma.serviceCatalog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 3. POST /api/services/admin - Create or Update a Service
// -------------------------------------------------------------
router.post('/admin', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const {
      id,
      title,
      category,
      description,
      deliverables,
      pricingModel,
      basePrice,
      billingFrequency,
      estimatedDuration,
      unit,
      isActive,
    } = req.body;

    if (!title || basePrice === undefined) {
      return res.status(400).json({ success: false, error: 'Title and base price are required.' });
    }

    let service;
    if (id) {
      service = await prisma.serviceCatalog.update({
        where: { id },
        data: {
          title,
          category,
          description,
          deliverables,
          pricingModel,
          basePrice: parseFloat(basePrice),
          billingFrequency,
          estimatedDuration,
          unit,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    } else {
      service = await prisma.serviceCatalog.create({
        data: {
          title,
          category: category || 'Web Development',
          description,
          deliverables,
          pricingModel: pricingModel || 'FIXED',
          basePrice: parseFloat(basePrice),
          billingFrequency: billingFrequency || 'ONE_TIME',
          estimatedDuration,
          unit: unit || 'project',
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    }

    res.json({ success: true, service });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 4. POST /api/services/request - Client Submits a Service Request
// -------------------------------------------------------------
router.post('/request', authenticate, async (req, res, next) => {
  try {
    const { serviceIds, requirements, targetDate, referenceLinks, estimatedBudget } = req.body;

    if (!serviceIds || !serviceIds.length || !requirements) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one service and provide your project requirements.',
      });
    }

    // Get client profile
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!clientProfile) {
      // Auto-create client profile for user if needed
      clientProfile = await prisma.clientProfile.create({
        data: {
          userId: req.user.id,
          companyName: `${req.user.firstName}'s Organization`,
          country: 'India',
        },
      });
    }

    // Fetch the selected services
    const services = await prisma.serviceCatalog.findMany({
      where: { id: { in: serviceIds } },
    });

    if (!services.length) {
      return res.status(400).json({ success: false, error: 'Selected services were not found in catalog.' });
    }

    const serviceTitles = services.map(s => s.title).join(', ');
    const calculatedBudget = services.reduce((sum, s) => sum + Number(s.basePrice), 0);
    const requestNumber = `SR-${Date.now().toString().slice(-6)}`;

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        requestNumber,
        clientId: clientProfile.id,
        serviceIds: JSON.stringify(serviceIds),
        serviceTitles,
        requirements,
        targetDate: targetDate ? new Date(targetDate) : null,
        referenceLinks,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : calculatedBudget,
        status: 'SUBMITTED',
      },
    });

    // Notify Admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Client Service Request',
          message: `${clientProfile.companyName} submitted request ${requestNumber} for ${serviceTitles}.`,
          type: 'PROJECT',
          link: '/app/admin/services',
        },
      });
    }

    await logAudit({
      userId: req.user.id,
      action: 'SUBMIT_SERVICE_REQUEST',
      resource: 'ServiceRequest',
      resourceId: serviceRequest.id,
      details: { requestNumber, serviceTitles, calculatedBudget },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully.',
      serviceRequest,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 5. GET /api/services/requests - List Service Requests
// -------------------------------------------------------------
router.get('/requests', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};

    if (req.user.role === 'CLIENT') {
      const client = await prisma.clientProfile.findUnique({ where: { userId: req.user.id } });
      if (!client) return res.json({ success: true, requests: [] });
      where.clientId = client.id;
    }

    if (status) where.status = status;

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        client: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        invoice: { select: { id: true, invoiceNumber: true, totalAmount: true, status: true } },
        project: { select: { id: true, name: true, code: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 6. POST /api/services/requests/:id/quotation - Admin Generates Quotation & Invoice
// -------------------------------------------------------------
router.post('/requests/:id/quotation', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quotationAmount, quotationNotes, assignedLeaderId } = req.body;

    if (!quotationAmount || Number(quotationAmount) <= 0) {
      return res.status(400).json({ success: false, error: 'A valid quotation amount is required.' });
    }

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!serviceRequest) {
      return res.status(404).json({ success: false, error: 'Service request not found.' });
    }

    const subtotal = parseFloat(quotationAmount);
    const taxRate = 18.0; // 18% GST default
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create Invoice within transaction
    const [invoice, updatedRequest] = await prisma.$transaction([
      prisma.invoice.create({
        data: {
          invoiceNumber,
          clientId: serviceRequest.clientId,
          createdById: req.user.id,
          status: 'ISSUED',
          issueDate: new Date(),
          dueDate,
          currency: 'INR',
          subtotal,
          taxRate,
          taxAmount,
          discount: 0,
          totalAmount,
          paidAmount: 0,
          balanceDue: totalAmount,
          notes: quotationNotes || `Quotation and Invoice for ${serviceRequest.serviceTitles}`,
          items: {
            create: [
              {
                description: serviceRequest.serviceTitles,
                quantity: 1,
                unitPrice: subtotal,
                amount: subtotal,
              },
            ],
          },
        },
      }),
      prisma.serviceRequest.update({
        where: { id },
        data: {
          quotationAmount: subtotal,
          quotationNotes,
          assignedLeaderId: assignedLeaderId || null,
          status: 'AWAITING_PAYMENT',
        },
      }),
    ]);

    // Link the created invoice
    await prisma.serviceRequest.update({
      where: { id },
      data: { invoiceId: invoice.id },
    });

    // Notify Client
    await prisma.notification.create({
      data: {
        userId: serviceRequest.client.userId,
        title: 'Quotation Ready for Approval & Payment',
        message: `Your quotation for request ${serviceRequest.requestNumber} is ready: Rs. ${totalAmount.toLocaleString()} (Invoice ${invoiceNumber}).`,
        type: 'FINANCE',
        link: '/app/client-progress',
      },
    });

    res.json({
      success: true,
      message: 'Quotation prepared and Invoice generated successfully.',
      invoice,
      serviceRequest: updatedRequest,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 7. POST /api/services/requests/:id/pay - Complete Payment & Activate Project
// -------------------------------------------------------------
router.post('/requests/:id/pay', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionRef } = req.body;

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
        invoice: true,
      },
    });

    if (!serviceRequest) {
      return res.status(404).json({ success: false, error: 'Service request not found.' });
    }

    if (!serviceRequest.invoice) {
      return res.status(400).json({ success: false, error: 'No quotation/invoice has been prepared for this request.' });
    }

    // Security check: Client can only pay their own request
    if (req.user.role === 'CLIENT' && serviceRequest.client.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to pay for this service request.' });
    }

    // Check if already paid to prevent duplicate processing
    if (serviceRequest.status === 'PAID' || serviceRequest.status === 'CONFIRMED' || serviceRequest.status === 'IN_PROGRESS') {
      return res.json({
        success: true,
        message: 'This request is already paid and confirmed.',
        serviceRequest,
      });
    }

    const invoice = serviceRequest.invoice;
    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
    const paymentAmount = Number(invoice.totalAmount);

    // Run in Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Record Payment
      const payment = await tx.payment.create({
        data: {
          receiptNumber,
          invoiceId: invoice.id,
          recordedById: req.user.id,
          amount: paymentAmount,
          paymentMethod: paymentMethod || 'ONLINE_GATEWAY_TEST',
          transactionRef: transactionRef || `TXN-${Date.now()}`,
          notes: `Confirmed payment for Service Request ${serviceRequest.requestNumber}`,
        },
      });

      // 2. Mark Invoice PAID
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'PAID',
          paidAmount: paymentAmount,
          balanceDue: 0,
        },
      });

      // 3. Double-entry Journal Entry
      const cashAccount = await tx.account.findUnique({ where: { code: '1000' } });
      const arAccount = await tx.account.findUnique({ where: { code: '1100' } });

      if (cashAccount && arAccount) {
        await tx.journalEntry.create({
          data: {
            entryNumber: `JE-${Date.now().toString().slice(-6)}`,
            description: `Payment for Service Request ${serviceRequest.requestNumber} (${serviceRequest.serviceTitles})`,
            reference: receiptNumber,
            lines: {
              create: [
                { accountId: cashAccount.id, debit: paymentAmount, credit: 0 },
                { accountId: arAccount.id, debit: 0, credit: paymentAmount },
              ],
            },
          },
        });
      }

      // 4. Auto-Provision / Link Project
      let projectId = serviceRequest.projectId;
      if (!projectId) {
        const projectCode = `PRJ-${Date.now().toString().slice(-4)}`;
        const projectDeadline = new Date();
        projectDeadline.setDate(projectDeadline.getDate() + 30);

        const project = await tx.project.create({
          data: {
            name: `${serviceRequest.client.companyName} - ${serviceRequest.serviceTitles.split(',')[0]}`,
            code: projectCode,
            clientId: serviceRequest.clientId,
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            startDate: new Date(),
            deadline: projectDeadline,
            budget: paymentAmount,
            progress: 10,
            isClientPortal: true,
            description: serviceRequest.requirements,
          },
        });

        projectId = project.id;

        // Assign Team Leader if specified
        if (serviceRequest.assignedLeaderId) {
          await tx.projectMember.create({
            data: {
              projectId,
              userId: serviceRequest.assignedLeaderId,
              roleTitle: 'Team Leader',
              isLeader: true,
            },
          });
        }

        // Add initial milestone
        await tx.projectMilestone.create({
          data: {
            projectId,
            title: 'Project Kickoff & Requirements Finalization',
            description: 'Initiate architecture, assign engineering team, and define initial sprints.',
            dueDate: new Date(Date.now() + 7 * 86400000),
            isCompleted: true,
            isClientVisible: true,
          },
        });

        // Add initial client progress update
        await tx.clientProgressUpdate.create({
          data: {
            projectId,
            updateDate: new Date(),
            title: 'Project Activated & Kickoff Scheduled',
            completedToday: `Service request confirmed and verified. Team initialized for ${serviceRequest.serviceTitles}.`,
            currentStatus: 'Active - Sprint 1 Underway',
            nextSteps: 'Finalize deliverable milestones and begin development sprints.',
            publishedById: req.user.id,
          },
        });
      }

      // 5. Update Service Request to PAID and CONFIRMED
      const updatedReq = await tx.serviceRequest.update({
        where: { id: serviceRequest.id },
        data: {
          status: 'PAID',
          projectId,
        },
      });

      return { payment, updatedReq, projectId };
    });

    // In-App Notification
    await prisma.notification.create({
      data: {
        userId: serviceRequest.client.userId,
        title: 'Payment Confirmed & Project Activated!',
        message: `Your payment of Rs. ${paymentAmount.toLocaleString()} has been confirmed. Receipt: ${receiptNumber}. Project is now active.`,
        type: 'FINANCE',
        link: '/app/client-progress',
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'PAY_SERVICE_REQUEST',
      resource: 'ServiceRequest',
      resourceId: serviceRequest.id,
      details: { receiptNumber, amount: paymentAmount, projectId: result.projectId },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Payment verified and project activated successfully.',
      receiptNumber,
      projectId: result.projectId,
      serviceRequest: result.updatedReq,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
