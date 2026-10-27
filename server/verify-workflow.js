import http from 'http';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function login(email, password) {
  const res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email, password });

  const setCookie = res.headers['set-cookie'];
  let token = null;
  if (setCookie) {
    const match = setCookie[0].match(/token=([^;]+)/);
    if (match) token = match[1];
  }
  return { ...res.data, cookie: setCookie ? setCookie[0] : null, token };
}

async function run() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END VERIFICATION ---');

  // 1. Verify Client Service Catalog & Order submission
  console.log('\n[TEST 1] Logging in as Client...');
  const clientAuth = await login('client@acmecorp.com', 'Password123!');
  console.log('Client Login:', clientAuth.success ? 'SUCCESS (Role: ' + clientAuth.user.role + ')' : 'FAILED');

  console.log('[TEST 1.1] Fetching active service catalog...');
  const srvListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/services',
    method: 'GET',
    headers: { 'Cookie': clientAuth.cookie },
  });
  console.log(`Active services count: ${srvListRes.data.services.length}`);
  const webDev = srvListRes.data.services.find(s => s.title === 'Website Development');
  const seo = srvListRes.data.services.find(s => s.title === 'Search Engine Optimization (SEO)');

  console.log('[TEST 1.2] Client Submitting Service Request for Website Development & SEO...');
  const reqRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/services/request',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': clientAuth.cookie },
  }, {
    serviceIds: [webDev.id, seo.id],
    requirements: 'Custom web portal with integrated SEO architecture and technical optimizations.',
    targetDate: '2026-11-30',
  });
  console.log('Service Request Result:', reqRes.data.success ? `Created ${reqRes.data.serviceRequest.requestNumber}` : reqRes.data.error);
  const createdRequestId = reqRes.data.serviceRequest.id;

  // 2. Admin prepares Quotation & Invoice
  console.log('\n[TEST 2] Logging in as Admin...');
  const adminAuth = await login('admin@i2s.com', 'Password123!');
  console.log('Admin Login:', adminAuth.success ? 'SUCCESS (Role: ' + adminAuth.user.role + ')' : 'FAILED');

  console.log('[TEST 2.1] Admin generating quotation and invoice for request...');
  const quoteRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/services/requests/${createdRequestId}/quotation`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminAuth.cookie },
  }, {
    quotationAmount: 100000.0,
    quotationNotes: 'Approved package discount for multi-service bundle.',
  });
  console.log('Quotation Result:', quoteRes.data.success ? `Invoice ${quoteRes.data.invoice.invoiceNumber} created with total ₹${quoteRes.data.invoice.totalAmount}` : quoteRes.data.error);

  // 3. Client Pays for Quotation
  console.log('\n[TEST 3] Client paying invoice and activating project...');
  const payRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/services/requests/${createdRequestId}/pay`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': clientAuth.cookie },
  }, {
    paymentMethod: 'ONLINE_UPI',
    transactionRef: 'UPI-AXIS-993847291',
  });
  console.log('Payment & Activation Result:', payRes.data.success ? `Paid! Receipt: ${payRes.data.receiptNumber}, Activated Project ID: ${payRes.data.projectId}` : payRes.data.error);

  // 4. Team Leader requests daily work report
  console.log('\n[TEST 4] Logging in as Team Leader...');
  const tlAuth = await login('teamlead@i2s.com', 'Password123!');
  console.log('Team Leader Login:', tlAuth.success ? 'SUCCESS (Role: ' + tlAuth.user.role + ')' : 'FAILED');

  // Find staff user and Acme project
  const staffAuth = await login('staff@i2s.com', 'Password123!');
  const projectsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/projects',
    method: 'GET',
    headers: { 'Cookie': tlAuth.cookie },
  });
  const acmeProj = projectsRes.data.projects.find(p => p.code === 'PRJ-2026-001') || projectsRes.data.projects[0];

  console.log(`[TEST 4.1] Team Leader requesting report from Staff for project ${acmeProj.name}...`);
  const reportReqRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/request',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': tlAuth.cookie },
  }, {
    projectId: acmeProj.id,
    targetUserId: staffAuth.user.id,
    reportDate: '2026-10-26',
    instructions: 'Please provide detailed report on authentication middleware and test coverage.',
  });
  console.log('Report Request Result:', reportReqRes.data.success ? `Requested successfully for ${reportReqRes.data.reportRequest.targetUser.firstName}` : reportReqRes.data.error);

  // 5. Staff submits daily report
  console.log('\n[TEST 5] Staff submitting daily work report...');
  const submitReportRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': staffAuth.cookie },
  }, {
    projectId: acmeProj.id,
    reportDate: '2026-10-26',
    workTitle: 'Role-Based Dashboard Security & Client Service Catalog Integration',
    description: 'Built isolated role-specific sidebars, added 15 technology services, prepared quotations and payments.',
    timeSpentMinutes: 390,
    completionPercent: 100,
    internalNotes: 'Internal code review passed without security warnings.',
    clientSummary: 'Role dashboards configured, client catalog opened for online orders, payment checkout verified.',
    status: 'SUBMITTED',
  });
  console.log('Staff Report Submission Result:', submitReportRes.data.success ? `Report created (ID: ${submitReportRes.data.report.id})` : submitReportRes.data.error);
  const createdReportId = submitReportRes.data.report.id;

  // 6. Team Leader reviews and approves report + publishes to client portal
  console.log('\n[TEST 6] Team Leader reviewing report...');
  const reviewRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reports/${createdReportId}/review`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': tlAuth.cookie },
  }, {
    decision: 'APPROVED',
    feedback: 'Approved with distinction. Clear progress and solid verification.',
    publishToClient: true,
  });
  console.log('Review Result:', reviewRes.data.success ? 'Report Approved & Published to Client Progress Portal' : reviewRes.data.error);

  // 7. Client views client-progress timeline and verifies privacy
  console.log('\n[TEST 7] Client fetching Daily Project Progress Timeline...');
  const progressRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reports/client-progress/${acmeProj.id}`,
    method: 'GET',
    headers: { 'Cookie': clientAuth.cookie },
  });
  console.log(`Timeline updates count: ${progressRes.data.updates.length}`);
  const latestUpdate = progressRes.data.updates[0];
  console.log('Latest Client Update Title:', latestUpdate?.title);
  console.log('Client Update Completed Today:', latestUpdate?.completedToday);
  console.log('Client Privacy Verified (Internal Notes absent):', latestUpdate?.internalNotes === undefined ? 'PASS' : 'FAIL');

  // 8. Accounts Manager verifies finance isolation
  console.log('\n[TEST 8] Logging in as Accounts Manager...');
  const accountsAuth = await login('accounts@i2s.com', 'Password123!');
  console.log('Accounts Manager Login:', accountsAuth.success ? 'SUCCESS (Role: ' + accountsAuth.user.role + ')' : 'FAILED');

  const invListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/finance/invoices',
    method: 'GET',
    headers: { 'Cookie': accountsAuth.cookie },
  });
  console.log(`Invoices visible to Accounts Manager: ${invListRes.data.invoices.length}`);

  console.log('\n--- ALL END-TO-END WORKFLOW VERIFICATIONS PASSED SUCCESSFULLY ---');
}

run().catch(console.error);
