import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding I2S Business OS database...');

  // 1. Company Settings
  const settings = [
    { key: 'COMPANY_NAME', value: 'Imagination2Software', category: 'GENERAL', description: 'Legal company name' },
    { key: 'COMPANY_EMAIL', value: 'contact@imagination2software.com', category: 'GENERAL', description: 'Primary business email' },
    { key: 'DEFAULT_CURRENCY', value: 'INR', category: 'FINANCE', description: 'Base operating currency' },
    { key: 'DEFAULT_GST_RATE', value: '18', category: 'FINANCE', description: 'Standard GST percentage' },
    { key: 'INVOICE_PREFIX', value: 'INV-2026-', category: 'FINANCE', description: 'Invoice numbering prefix' },
    { key: 'RECEIPT_PREFIX', value: 'RCP-2026-', category: 'FINANCE', description: 'Payment receipt prefix' },
  ];

  for (const s of settings) {
    await prisma.companySetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 2. Chart of Accounts (Double-Entry Ledger Foundation)
  const defaultAccounts = [
    { code: '1000', name: 'Cash and Bank Equivalents', type: 'ASSET' },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET' },
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
    { code: '2100', name: 'GST Output Payable', type: 'LIABILITY' },
    { code: '3000', name: 'Retained Earnings', type: 'EQUITY' },
    { code: '4000', name: 'Software Development & Consulting Revenue', type: 'REVENUE' },
    { code: '5000', name: 'Salaries & Stipends Expense', type: 'EXPENSE' },
    { code: '5100', name: 'Infrastructure & Cloud Hosting', type: 'EXPENSE' },
    { code: '5200', name: 'Office Operations & Utilities', type: 'EXPENSE' },
  ];

  for (const acc of defaultAccounts) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: { name: acc.name, type: acc.type },
      create: acc,
    });
  }

  // 3. Departments
  const departments = [
    { name: 'Engineering & Technology', description: 'Software architecture, web, and cloud solutions' },
    { name: 'Human Resources', description: 'Talent, payroll, performance, and compliance' },
    { name: 'Finance & Accounts', description: 'Ledgers, invoicing, auditing, and tax compliance' },
    { name: 'Product & Design', description: 'UI/UX design, wireframing, and product strategy' },
  ];

  const deptMap = {};
  for (const d of departments) {
    const record = await prisma.department.upsert({
      where: { name: d.name },
      update: { description: d.description },
      create: d,
    });
    deptMap[d.name] = record.id;
  }

  // Common secure hash for development seeding (Password: Password123!)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 4. Seed 8 Role-Based Users
  const seedUsers = [
    {
      email: 'superadmin@i2s.com',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      role: 'SUPER_ADMIN',
      phone: '+91 98765 00001',
      employee: {
        code: 'I2S-SA-001',
        designation: 'Managing Director / Chief Executive',
        dept: 'Engineering & Technology',
        salary: 250000.0,
      },
    },
    {
      email: 'admin@i2s.com',
      firstName: 'Pooja',
      lastName: 'Nair',
      role: 'ADMIN',
      phone: '+91 98765 00002',
      employee: {
        code: 'I2S-ADM-002',
        designation: 'Operations Director',
        dept: 'Engineering & Technology',
        salary: 180000.0,
      },
    },
    {
      email: 'accounts@i2s.com',
      firstName: 'Amit',
      lastName: 'Verma',
      role: 'ACCOUNTS_MANAGER',
      phone: '+91 98765 00003',
      employee: {
        code: 'I2S-ACC-003',
        designation: 'Lead Finance Controller',
        dept: 'Finance & Accounts',
        salary: 140000.0,
      },
    },
    {
      email: 'hr@i2s.com',
      firstName: 'Sneha',
      lastName: 'Menon',
      role: 'HR_MANAGER',
      phone: '+91 98765 00004',
      employee: {
        code: 'I2S-HR-004',
        designation: 'Head of People Operations',
        dept: 'Human Resources',
        salary: 130000.0,
      },
    },
    {
      email: 'teamlead@i2s.com',
      firstName: 'Vikram',
      lastName: 'Patel',
      role: 'TEAM_LEADER',
      phone: '+91 98765 00005',
      employee: {
        code: 'I2S-TL-005',
        designation: 'Principal Tech Lead',
        dept: 'Engineering & Technology',
        salary: 150000.0,
      },
    },
    {
      email: 'staff@i2s.com',
      firstName: 'Arjun',
      lastName: 'Reddy',
      role: 'STAFF',
      phone: '+91 98765 00006',
      employee: {
        code: 'I2S-DEV-006',
        designation: 'Full Stack Software Engineer',
        dept: 'Engineering & Technology',
        salary: 85000.0,
      },
    },
    {
      email: 'intern@i2s.com',
      firstName: 'Ananya',
      lastName: 'Gupta',
      role: 'INTERN',
      phone: '+91 98765 00007',
      employee: {
        code: 'I2S-INT-007',
        designation: 'Software Engineering Intern',
        dept: 'Engineering & Technology',
        salary: 0.0,
        stipend: 25000.0,
      },
    },
  ];

  const userMap = {};

  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        phone: u.phone,
        passwordHash,
      },
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        phone: u.phone,
        passwordHash,
      },
    });

    userMap[u.role] = user;

    if (u.employee) {
      await prisma.employeeProfile.upsert({
        where: { userId: user.id },
        update: {
          employeeCode: u.employee.code,
          designation: u.employee.designation,
          departmentId: deptMap[u.employee.dept],
          baseSalary: u.employee.salary,
          stipendAmount: u.employee.stipend || null,
        },
        create: {
          userId: user.id,
          employeeCode: u.employee.code,
          designation: u.employee.designation,
          departmentId: deptMap[u.employee.dept],
          joiningDate: new Date('2025-01-15'),
          baseSalary: u.employee.salary,
          stipendAmount: u.employee.stipend || null,
        },
      });

      // Default leave balances
      const emp = await prisma.employeeProfile.findUnique({ where: { userId: user.id } });
      const leaveTypes = ['CASUAL', 'SICK', 'PAID'];
      for (const lt of leaveTypes) {
        await prisma.leaveBalance.upsert({
          where: {
            employeeProfileId_leaveType: {
              employeeProfileId: emp.id,
              leaveType: lt,
            },
          },
          update: {},
          create: {
            employeeProfileId: emp.id,
            leaveType: lt,
            totalAllowed: 12,
            usedDays: 1,
            remainingDays: 11,
          },
        });
      }
    }
  }

  // 5. Seed Client & Client Portal User
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@acmecorp.com' },
    update: {
      firstName: 'Rohan',
      lastName: 'Mehta',
      role: 'CLIENT',
      passwordHash,
    },
    create: {
      email: 'client@acmecorp.com',
      firstName: 'Rohan',
      lastName: 'Mehta',
      role: 'CLIENT',
      phone: '+91 99887 76655',
      passwordHash,
    },
  });

  const clientProfile = await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    update: {
      companyName: 'Acme Global Technologies Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      address: 'Tech Park, Whitefield',
      city: 'Bengaluru',
      internalNotes: 'Tier-1 strategic enterprise partner with quarterly retainer review.',
    },
    create: {
      userId: clientUser.id,
      companyName: 'Acme Global Technologies Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      address: 'Tech Park, Whitefield',
      city: 'Bengaluru',
      internalNotes: 'Tier-1 strategic enterprise partner with quarterly retainer review.',
    },
  });

  // 6. Seed Project, Milestones & Tasks
  const project = await prisma.project.upsert({
    where: { code: 'PRJ-ACME-01' },
    update: {
      progress: 45,
    },
    create: {
      clientId: clientProfile.id,
      name: 'Acme Cloud Platform Modernization',
      code: 'PRJ-ACME-01',
      description: 'End-to-end cloud migration and microservices API orchestration for enterprise scale.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-02-01'),
      deadline: new Date('2026-08-31'),
      budget: 1850000.0,
      progress: 45,
      isClientPortal: true,
    },
  });

  // Project Members
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: userMap['TEAM_LEADER'].id } },
    update: { isLeader: true },
    create: {
      projectId: project.id,
      userId: userMap['TEAM_LEADER'].id,
      roleTitle: 'Technical Project Lead',
      isLeader: true,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: userMap['STAFF'].id } },
    update: {},
    create: {
      projectId: project.id,
      userId: userMap['STAFF'].id,
      roleTitle: 'Senior Backend Developer',
      isLeader: false,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: userMap['INTERN'].id } },
    update: {},
    create: {
      projectId: project.id,
      userId: userMap['INTERN'].id,
      roleTitle: 'QA & Test Engineering Intern',
      isLeader: false,
    },
  });

  // Milestones
  await prisma.projectMilestone.upsert({
    where: { id: 'ms-phase-1-init' },
    update: {},
    create: {
      id: 'ms-phase-1-init',
      projectId: project.id,
      title: 'Phase 1: Architecture Review & Security Baseline',
      dueDate: new Date('2026-03-15'),
      isCompleted: true,
      isClientVisible: true,
    },
  });

  await prisma.projectMilestone.upsert({
    where: { id: 'ms-phase-2-api' },
    update: {},
    create: {
      id: 'ms-phase-2-api',
      projectId: project.id,
      title: 'Phase 2: Core Microservices & Billing Gateway API',
      dueDate: new Date('2026-05-30'),
      isCompleted: false,
      isClientVisible: true,
    },
  });

  // Tasks
  const task1 = await prisma.task.upsert({
    where: { id: 'task-auth-001' },
    update: {},
    create: {
      id: 'task-auth-001',
      projectId: project.id,
      title: 'Implement Multi-Factor Identity and RBAC Validation',
      description: 'Configure JWT session tokens, refresh token rotation, and fine-grained endpoint authorization.',
      priority: 'HIGH',
      status: 'COMPLETED',
      deadline: new Date('2026-03-10'),
      assigneeId: userMap['STAFF'].id,
      reviewerId: userMap['TEAM_LEADER'].id,
      submissionNotes: 'All RBAC tests passing with 100% coverage.',
      reviewFeedback: 'Approved for production staging.',
      isClientVisible: true,
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: 'task-api-002' },
    update: {},
    create: {
      id: 'task-api-002',
      projectId: project.id,
      title: 'Develop Double-Entry General Ledger Financial Engine',
      description: 'Ensure balanced journal lines (Debit = Credit) with immutable audit trails and rollback safeguards.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      deadline: new Date('2026-04-15'),
      assigneeId: userMap['STAFF'].id,
      reviewerId: userMap['TEAM_LEADER'].id,
      isClientVisible: false,
    },
  });

  const task3 = await prisma.task.upsert({
    where: { id: 'task-qa-003' },
    update: {},
    create: {
      id: 'task-qa-003',
      projectId: project.id,
      title: 'Write Automated End-to-End Regression Test Suite',
      description: 'Validate client isolation rules, document access restrictions, and financial reconciliation calculations.',
      priority: 'MEDIUM',
      status: 'SUBMITTED_FOR_REVIEW',
      deadline: new Date('2026-04-10'),
      assigneeId: userMap['INTERN'].id,
      reviewerId: userMap['STAFF'].id,
      submissionNotes: 'Automated test suites written for Vitest and Supertest.',
      isClientVisible: false,
    },
  });

  // 7. Seed Invoices, Line Items & Payments
  const invoice1 = await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-001' },
    update: {},
    create: {
      invoiceNumber: 'INV-2026-001',
      clientId: clientProfile.id,
      createdById: userMap['ACCOUNTS_MANAGER'].id,
      status: 'PARTIALLY_PAID',
      issueDate: new Date('2026-02-15'),
      dueDate: new Date('2026-03-15'),
      subtotal: 500000.0,
      taxRate: 18.0,
      taxAmount: 90000.0,
      discount: 10000.0,
      totalAmount: 580000.0,
      paidAmount: 300000.0,
      balanceDue: 280000.0,
      notes: 'Initial milestone payment for Architecture Review and Phase 1 Deliverables.',
      items: {
        create: [
          {
            description: 'Cloud Modernization Architecture Assessment & High-Level Design',
            quantity: 1,
            unitPrice: 300000.0,
            amount: 300000.0,
          },
          {
            description: 'Security & Compliance Hardening Implementation',
            quantity: 1,
            unitPrice: 200000.0,
            amount: 200000.0,
          },
        ],
      },
    },
  });

  // Payment record
  await prisma.payment.upsert({
    where: { receiptNumber: 'RCP-2026-001' },
    update: {},
    create: {
      receiptNumber: 'RCP-2026-001',
      invoiceId: invoice1.id,
      recordedById: userMap['ACCOUNTS_MANAGER'].id,
      amount: 300000.0,
      paymentMethod: 'BANK_TRANSFER',
      transactionRef: 'NEFT-HDFC-99238472',
      paymentDate: new Date('2026-02-28'),
      notes: 'Wire transfer confirmed via corporate current account.',
    },
  });

  // Balanced Journal Entry
  const cashAccount = await prisma.account.findUnique({ where: { code: '1000' } });
  const arAccount = await prisma.account.findUnique({ where: { code: '1100' } });

  await prisma.journalEntry.upsert({
    where: { entryNumber: 'JE-2026-001' },
    update: {},
    create: {
      entryNumber: 'JE-2026-001',
      date: new Date('2026-02-28'),
      description: 'Receipt of Partial Payment for INV-2026-001 (Acme Global)',
      reference: 'RCP-2026-001',
      lines: {
        create: [
          { accountId: cashAccount.id, debit: 300000.0, credit: 0.0 },
          { accountId: arAccount.id, debit: 0.0, credit: 300000.0 },
        ],
      },
    },
  });

  // 7.1 Seed Standard 15 Technology Services Catalog
  const serviceCatalogSeed = [
    {
      title: 'Website Development',
      category: 'Web Development',
      description: 'Custom, high-performance responsive web application built with modern architecture (React/Node/Postgres).',
      deliverables: 'Architecture plan, responsive frontend, API backend, database schema, unit tests, cloud deployment.',
      pricingModel: 'FIXED',
      basePrice: 75000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '3-4 Weeks',
      unit: 'project',
      isActive: true,
    },
    {
      title: 'Website Redesign',
      category: 'Web Development',
      description: 'Complete visual and structural overhaul of existing websites for modern aesthetics, speed, and mobile UX.',
      deliverables: 'Brand audit, UX wireframes, Figma interactive prototypes, responsive redesign, asset optimization.',
      pricingModel: 'FIXED',
      basePrice: 50000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '2-3 Weeks',
      unit: 'project',
      isActive: true,
    },
    {
      title: 'E-commerce Development',
      category: 'E-commerce',
      description: 'Full-featured online store with inventory sync, cart checkout, multi-gateway payments, and order tracking.',
      deliverables: 'Product catalog, payment gateway integration, shipping calculator, order management dashboard, secure auth.',
      pricingModel: 'FIXED',
      basePrice: 120000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '4-6 Weeks',
      unit: 'project',
      isActive: true,
    },
    {
      title: 'Website Maintenance',
      category: 'Maintenance',
      description: 'Continuous uptime monitoring, security patching, database backups, performance audits, and SLA support.',
      deliverables: '24/7 uptime monitoring, weekly security updates, off-site automated backups, monthly performance reports.',
      pricingModel: 'MONTHLY_RETAINER',
      basePrice: 15000.0,
      billingFrequency: 'MONTHLY',
      estimatedDuration: 'Ongoing Retainer',
      unit: 'month',
      isActive: true,
    },
    {
      title: 'Search Engine Optimization (SEO)',
      category: 'Digital Marketing',
      description: 'Technical, on-page, and off-page search engine optimization to rank keywords and increase organic conversion.',
      deliverables: 'Keyword research, meta tag optimizations, sitemap generation, structured schema, Google Search Console audits.',
      pricingModel: 'MONTHLY_RETAINER',
      basePrice: 25000.0,
      billingFrequency: 'MONTHLY',
      estimatedDuration: '3-6 Months',
      unit: 'month',
      isActive: true,
    },
    {
      title: 'Local SEO',
      category: 'Digital Marketing',
      description: 'Google Business Profile optimization, local citations, NAP consistency, and geo-targeted ranking.',
      deliverables: 'Google Business Profile setup, local directory submissions, customer review management strategy.',
      pricingModel: 'FIXED',
      basePrice: 20000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '2 Weeks',
      unit: 'setup',
      isActive: true,
    },
    {
      title: 'Digital Marketing',
      category: 'Digital Marketing',
      description: 'Multi-channel digital marketing campaigns combining email marketing, conversion funnels, and analytics.',
      deliverables: 'Campaign strategy, funnel optimization, audience segmentation, monthly ROI reports.',
      pricingModel: 'MONTHLY_RETAINER',
      basePrice: 35000.0,
      billingFrequency: 'MONTHLY',
      estimatedDuration: 'Ongoing Retainer',
      unit: 'month',
      isActive: true,
    },
    {
      title: 'Social Media Management',
      category: 'Marketing & Content',
      description: 'End-to-end content creation, post scheduling, hashtag research, and community engagement.',
      deliverables: 'Content calendar, 20 high-quality monthly posts, community moderation, performance insights.',
      pricingModel: 'MONTHLY_RETAINER',
      basePrice: 30000.0,
      billingFrequency: 'MONTHLY',
      estimatedDuration: 'Monthly Retainer',
      unit: 'month',
      isActive: true,
    },
    {
      title: 'Paid Advertising / PPC',
      category: 'Marketing & Content',
      description: 'High-ROI Google Ads and Meta Ads management, copy testing, negative keyword tuning, and conversion tracking.',
      deliverables: 'Ad copy creation, A/B landing page testing, audience targeting, conversion tag setup, weekly reporting.',
      pricingModel: 'MONTHLY_RETAINER',
      basePrice: 40000.0,
      billingFrequency: 'MONTHLY',
      estimatedDuration: 'Monthly Retainer',
      unit: 'month',
      isActive: true,
    },
    {
      title: 'Content Writing',
      category: 'Marketing & Content',
      description: 'SEO-optimized articles, authority blog posts, technical documentation, whitepapers, and landing page copy.',
      deliverables: 'Research, SEO keyword inclusion, plagiarism checks, proofreading, editorial review.',
      pricingModel: 'FIXED',
      basePrice: 15000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '1-2 Weeks',
      unit: 'bundle (5 articles)',
      isActive: true,
    },
    {
      title: 'Graphic Design',
      category: 'Creative Design',
      description: 'Marketing collateral, brochures, banner ads, product packaging, presentations, and vector illustrations.',
      deliverables: 'Source vector files (AI/Figma/SVG), high-resolution export formats, print-ready CMYK PDFs.',
      pricingModel: 'FIXED',
      basePrice: 18000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '1 Week',
      unit: 'package',
      isActive: true,
    },
    {
      title: 'Branding',
      category: 'Creative Design',
      description: 'Comprehensive corporate identity, logo marks, typography standards, color tokens, and brand guidelines.',
      deliverables: 'Primary & secondary logo variations, typography system, brand identity book, social media asset kit.',
      pricingModel: 'FIXED',
      basePrice: 45000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '2-3 Weeks',
      unit: 'brand kit',
      isActive: true,
    },
    {
      title: 'Video Editing and Production',
      category: 'Media Production',
      description: 'High-impact promotional videos, product demo reels, motion graphics, audio mastering, and color grading.',
      deliverables: '4K/1080p final render, motion titles, licensed audio soundtrack, aspect ratio exports (16:9, 9:16 reels).',
      pricingModel: 'FIXED',
      basePrice: 35000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '1-2 Weeks',
      unit: 'video',
      isActive: true,
    },
    {
      title: 'Automation and Workflow Integration',
      category: 'Custom Engineering',
      description: 'Custom API webhooks, CRM synchronization, Zapier/Make automations, and automated accounting workflows.',
      deliverables: 'Integration architecture, error handling logic, real-time sync listeners, operational playbook.',
      pricingModel: 'FIXED',
      basePrice: 60000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '2-3 Weeks',
      unit: 'integration',
      isActive: true,
    },
    {
      title: 'Custom Software Development',
      category: 'Custom Engineering',
      description: 'Bespoke enterprise ERP, SaaS platforms, or proprietary business management solutions tailored to client specs.',
      deliverables: 'Full-stack source code, automated CI/CD pipeline, enterprise cloud infrastructure, comprehensive documentation.',
      pricingModel: 'FIXED',
      basePrice: 180000.0,
      billingFrequency: 'ONE_TIME',
      estimatedDuration: '8-12 Weeks',
      unit: 'solution',
      isActive: true,
    },
  ];

  for (const s of serviceCatalogSeed) {
    await prisma.serviceCatalog.upsert({
      where: { title: s.title },
      update: {
        category: s.category,
        description: s.description,
        deliverables: s.deliverables,
        pricingModel: s.pricingModel,
        basePrice: s.basePrice,
        billingFrequency: s.billingFrequency,
        estimatedDuration: s.estimatedDuration,
        unit: s.unit,
        isActive: s.isActive,
      },
      create: s,
    });
  }

  // 8. Seed Sample Expenses
  await prisma.expense.createMany({
    data: [
      {
        title: 'AWS Cloud Production Cluster & RDS Postgres',
        category: 'Hosting',
        amount: 34500.0,
        expenseDate: new Date('2026-03-01'),
        isApproved: true,
        notes: 'Monthly enterprise hosting bill',
      },
      {
        title: 'JetBrains & Developer Productivity Tooling Licenses',
        category: 'Software',
        amount: 18000.0,
        expenseDate: new Date('2026-03-05'),
        isApproved: true,
        notes: 'Annual developer tool subscriptions',
      },
    ],
    skipDuplicates: true,
  });

  // 9. Seed Sample In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userMap['SUPER_ADMIN'].id,
        title: 'System Initialized',
        message: 'I2S Business OS has been configured and is fully operational.',
        type: 'SYSTEM',
        link: '/app/admin/settings',
      },
      {
        userId: userMap['ACCOUNTS_MANAGER'].id,
        title: 'Invoice Payment Recorded',
        message: 'Partial payment of Rs. 3,00,000 received for INV-2026-001.',
        type: 'FINANCE',
        link: '/app/finance/invoices',
      },
      {
        userId: userMap['TEAM_LEADER'].id,
        title: 'Task Submitted for Review',
        message: 'Intern Ananya Gupta submitted "Write Automated Test Suite" for review.',
        type: 'TASK',
        link: '/app/projects/tasks',
      },
      {
        userId: clientUser.id,
        title: 'Project Milestone Achieved',
        message: 'Milestone "Phase 1: Architecture Review" was completed on schedule.',
        type: 'PROJECT',
        link: '/app/client/projects',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
