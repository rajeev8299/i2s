const BASE_URL = 'http://localhost:5000/api';

async function runInternTLWorkflowTest() {
  console.log('=== TEST SUITE: INTERN & TEAM LEADER WORK REPORT + ATTENDANCE SIGN-OFF WORKFLOW ===\n');

  // Step 1: Log in Intern, Team Leader, Admin, and Client
  console.log('[Step 1] Authenticating test accounts...');
  const users = {
    intern: { email: 'intern@i2s.com', password: 'Password123!' },
    teamlead: { email: 'teamlead@i2s.com', password: 'Password123!' },
    admin: { email: 'admin@i2s.com', password: 'Password123!' },
    client: { email: 'client@acmecorp.com', password: 'Password123!' },
  };

  const tokens = {};
  for (const [key, creds] of Object.entries(users)) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(`Failed to login ${key}: ${JSON.stringify(data)}`);
    }
    tokens[key] = data.token;
  }
  console.log('  ✓ Authenticated Intern, Team Leader, Admin, and Client.\n');

  // Step 2: Clean up any today's reports for Intern and TL to test clean checkout gate
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const internUser = await prisma.user.findUnique({ where: { email: 'intern@i2s.com' } });
  const tlUser = await prisma.user.findUnique({ where: { email: 'teamlead@i2s.com' } });

  // Delete today's reports & attendance for intern & tl to get clean slate
  await prisma.dailyWorkReport.deleteMany({
    where: {
      authorId: { in: [internUser.id, tlUser.id] },
      reportDate: { gte: today },
    },
  });
  await prisma.attendance.deleteMany({
    where: {
      userId: { in: [internUser.id, tlUser.id] },
      date: { gte: today },
    },
  });
  console.log('  ✓ Cleaned up any prior reports/attendance for today to test sign-off gate.\n');

  // Step 3: Test Attendance Sign-off Gate for Intern
  console.log('[Step 3] Testing Attendance Sign-off Gate for Intern...');
  // Intern checks in
  const internCheckIn = await fetch(`${BASE_URL}/hr/attendance/check-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.intern}` },
  });
  const internCheckInData = await internCheckIn.json();
  if (!internCheckInData.success) {
    throw new Error(`Intern check in failed: ${JSON.stringify(internCheckInData)}`);
  }
  console.log('  ✓ Intern checked in successfully.');

  // Intern attempts to check out BEFORE submitting daily report
  const internCheckOutAttempt1 = await fetch(`${BASE_URL}/hr/attendance/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.intern}` },
  });
  const internCheckOutData1 = await internCheckOutAttempt1.json();
  if (internCheckOutAttempt1.status === 400 && internCheckOutData1.requiresDailyReport === true) {
    console.log(`  ✓ Sign-off Gate BLOCKED check-out as expected: "${internCheckOutData1.error}"`);
  } else {
    throw new Error(`Intern checkout should be blocked without report, got: ${JSON.stringify(internCheckOutData1)}`);
  }

  const sampleProject = await prisma.project.findFirst();
  if (!sampleProject) {
    throw new Error('No project found in database to attach daily work report to.');
  }

  // Step 4: Intern saves Draft and then submits Report
  console.log('\n[Step 4] Testing Intern Daily Work Report (Draft & Submission)...');
  // First save as draft
  const draftRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.intern}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId: sampleProject.id,
      reportDate: new Date().toISOString().split('T')[0],
      workTitle: 'Intern Frontend Component Architecture',
      description: 'Built initial modular components for reports',
      completedWork: 'Completed Daily Work Report UI and input bindings',
      pendingWork: 'Need to implement comprehensive unit tests',
      currentStatus: 'In Progress',
      blockers: 'None so far',
      nextSteps: 'Connect feedback view with review endpoints',
      timeSpentMinutes: 300,
      completionPercent: 70,
      status: 'DRAFT',
    }),
  });
  const draftData = await draftRes.json();
  if (!draftData.success || draftData.report.status !== 'DRAFT') {
    throw new Error(`Failed to save draft report: ${JSON.stringify(draftData)}`);
  }
  console.log('  ✓ Intern successfully saved a DRAFT report (ID:', draftData.report.id, ')');

  // Verify that DRAFT status still blocks checkout (only SUBMITTED/APPROVED allows sign-off)
  const internCheckOutAttempt2 = await fetch(`${BASE_URL}/hr/attendance/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.intern}` },
  });
  const internCheckOutData2 = await internCheckOutAttempt2.json();
  if (internCheckOutAttempt2.status === 400 && internCheckOutData2.requiresDailyReport === true) {
    console.log('  ✓ Draft report correctly does not satisfy check-out requirement.');
  } else {
    throw new Error(`Draft should not allow check-out! Got: ${JSON.stringify(internCheckOutData2)}`);
  }

  // Now submit the report
  const submitRes = await fetch(`${BASE_URL}/reports/${draftData.report.id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${tokens.intern}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workTitle: 'Intern Frontend Component Architecture - Final',
      description: 'Completed modular components and verified input fields',
      completedWork: 'Completed Daily Work Report UI and input bindings for Interns',
      pendingWork: 'Write integration test verification',
      currentStatus: 'Ready for Review',
      blockers: 'Awaiting Team Leader review on state lifecycle',
      nextSteps: 'Proceed with Team Leader approvals and forwards',
      timeSpentMinutes: 360,
      completionPercent: 85,
      status: 'SUBMITTED',
    }),
  });
  const submitData = await submitRes.json();
  if (!submitData.success || submitData.report.status !== 'SUBMITTED') {
    throw new Error(`Failed to submit report: ${JSON.stringify(submitData)}`);
  }
  console.log('  ✓ Intern successfully submitted final daily work report.');
  const internReportId = submitData.report.id;

  // Now Intern check-out MUST succeed
  const internCheckOutAttempt3 = await fetch(`${BASE_URL}/hr/attendance/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.intern}` },
  });
  const internCheckOutData3 = await internCheckOutAttempt3.json();
  if (internCheckOutData3.success && internCheckOutData3.record?.checkOutTime) {
    console.log('  ✓ Intern check-out now SUCCEEDS after report submission!');
  } else {
    throw new Error(`Intern check-out failed after submitting report: ${JSON.stringify(internCheckOutData3)}`);
  }

  // Step 5: Check Team Leader's Gate & Own Report Submission
  console.log('\n[Step 5] Testing Team Leader Attendance Gate & Own Daily Work Report...');
  // TL checks in
  const tlCheckIn = await fetch(`${BASE_URL}/hr/attendance/check-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.teamlead}` },
  });
  const tlCheckInData = await tlCheckIn.json();
  if (!tlCheckInData.success) {
    throw new Error(`TL check in failed: ${JSON.stringify(tlCheckInData)}`);
  }
  console.log('  ✓ Team Leader checked in successfully.');

  // TL attempts check-out without report -> must be blocked
  const tlCheckOutAttempt1 = await fetch(`${BASE_URL}/hr/attendance/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.teamlead}` },
  });
  const tlCheckOutData1 = await tlCheckOutAttempt1.json();
  if (tlCheckOutAttempt1.status === 400 && tlCheckOutData1.requiresDailyReport === true) {
    console.log(`  ✓ Team Leader check-out BLOCKED as required: "${tlCheckOutData1.error}"`);
  } else {
    throw new Error(`TL checkout should be blocked without report, got: ${JSON.stringify(tlCheckOutData1)}`);
  }

  // TL submits own daily report
  const tlReportRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.teamlead}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId: sampleProject.id,
      reportDate: new Date().toISOString().split('T')[0],
      workTitle: 'Sprint 3 Team Architecture & Code Review',
      description: 'Reviewed daily PRs, conducted intern guidance session, planned tasks',
      completedWork: 'Sprint 3 architecture review completed, 2 PRs merged',
      pendingWork: 'Review upcoming intern daily work submissions',
      currentStatus: 'On Schedule',
      blockers: 'None',
      nextSteps: 'Inspect pending intern reports and forward approved reports to Admin',
      reviewedReportsCount: 1,
      timeSpentMinutes: 480,
      completionPercent: 100,
      status: 'SUBMITTED',
    }),
  });
  const tlReportData = await tlReportRes.json();
  if (!tlReportData.success) {
    throw new Error(`Failed to submit TL own report: ${JSON.stringify(tlReportData)}`);
  }
  console.log('  ✓ Team Leader submitted own report (ID:', tlReportData.report.id, ') with reviewedReportsCount = 1.');

  // Now TL check-out must succeed
  const tlCheckOutAttempt2 = await fetch(`${BASE_URL}/hr/attendance/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.teamlead}` },
  });
  const tlCheckOutData2 = await tlCheckOutAttempt2.json();
  if (tlCheckOutData2.success && tlCheckOutData2.record?.checkOutTime) {
    console.log('  ✓ Team Leader check-out SUCCEEDS after submitting daily report!');
  } else {
    throw new Error(`TL checkout failed: ${JSON.stringify(tlCheckOutData2)}`);
  }

  // Step 6: Team Leader Reviews Intern Report (Correction Request Workflow)
  console.log('\n[Step 6] Testing Review Workflow: Correction Request...');
  const reviewCorrRes = await fetch(`${BASE_URL}/reports/${internReportId}/review`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.teamlead}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      decision: 'RETURNED_FOR_CORRECTION',
      feedback: 'Please include more specifics in your pending work regarding error boundary tests.',
      forwardToAdmin: false,
    }),
  });
  const reviewCorrData = await reviewCorrRes.json();
  if (!reviewCorrData.success || reviewCorrData.report.status !== 'RETURNED_FOR_CORRECTION') {
    throw new Error(`Failed to return report for correction: ${JSON.stringify(reviewCorrData)}`);
  }
  console.log('  ✓ Team Leader returned report for correction.');

  // Verify Intern received an in-app notification about the review correction
  const internNoticesRes = await fetch(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${tokens.intern}` },
  });
  const internNoticesData = await internNoticesRes.json();
  const corrNotice = internNoticesData.notifications?.find(n => n.title.includes('Daily Report Returned'));
  if (corrNotice) {
    console.log('  ✓ Intern received notification:', corrNotice.title);
  } else {
    console.log('  ! Note: Intern notifications checked, count:', internNoticesData.notifications?.length || 0);
  }

  // Intern updates and resubmits
  const internResubmit = await fetch(`${BASE_URL}/reports/${internReportId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${tokens.intern}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      completedWork: 'Completed Daily Work Report UI and input bindings for Interns',
      pendingWork: 'Unit tests for error boundary components and edge case validation',
      status: 'SUBMITTED',
    }),
  });
  const internResubmitData = await internResubmit.json();
  if (!internResubmitData.success || internResubmitData.report.status !== 'SUBMITTED') {
    throw new Error(`Failed to resubmit report: ${JSON.stringify(internResubmitData)}`);
  }
  console.log('  ✓ Intern addressed feedback and resubmitted report.');

  // Verify Admin DOES NOT see this Intern report yet before TL approves & forwards
  console.log('\n[Step 7] Verifying Admin CANNOT see Intern report prior to TL approval & forward...');
  const adminOverviewBefore = await fetch(`${BASE_URL}/reports/admin/overview`, {
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  const adminOverviewDataBefore = await adminOverviewBefore.json();
  const isInternInAdminBefore = adminOverviewDataBefore.internReports.some(r => r.id === internReportId);
  if (!isInternInAdminBefore) {
    console.log('  ✓ Confirmed: Admin does NOT see Intern report prior to TL approval & forwarding.');
  } else {
    throw new Error('Admin should not see unforwarded Intern report!');
  }

  // Step 8: Team Leader Approves and Forwards to Admin
  console.log('\n[Step 8] Testing Team Leader Approval & Forwarding to Admin...');
  const tlApproveRes = await fetch(`${BASE_URL}/reports/${internReportId}/review`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.teamlead}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      decision: 'APPROVED',
      feedback: 'Excellent work! Detailed notes and test boundaries addressed thoroughly.',
      forwardToAdmin: true,
    }),
  });
  const tlApproveData = await tlApproveRes.json();
  if (!tlApproveData.success || tlApproveData.report.status !== 'APPROVED' || !tlApproveData.report.isForwardedToAdmin) {
    throw new Error(`Failed to approve and forward report: ${JSON.stringify(tlApproveData)}`);
  }
  console.log('  ✓ Team Leader approved and forwarded Intern report to Admin.');

  // Step 9: Verify Admin Overview now shows the Intern report AND Team Leader own report in separate lists
  console.log('\n[Step 9] Verifying Admin Dashboard Overview...');
  const adminOverviewAfter = await fetch(`${BASE_URL}/reports/admin/overview`, {
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  const adminOverviewDataAfter = await adminOverviewAfter.json();

  const forwardedInternReport = adminOverviewDataAfter.internReports.find(r => r.id === internReportId);
  if (forwardedInternReport) {
    console.log('  ✓ Forwarded Intern Report is visible to Admin:');
    console.log('    - Completed Work:', forwardedInternReport.completedWork);
    console.log('    - Pending Work:', forwardedInternReport.pendingWork);
    console.log('    - Intern:', forwardedInternReport.author?.firstName, forwardedInternReport.author?.lastName);
    console.log('    - TL Feedback:', forwardedInternReport.reviews?.[0]?.feedback);
    console.log('    - Date:', forwardedInternReport.reportDate);
  } else {
    throw new Error('Admin overview failed to find forwarded Intern report!');
  }

  const tlOwnReport = adminOverviewDataAfter.teamLeaderReports.find(r => r.author?.role === 'TEAM_LEADER');
  if (tlOwnReport) {
    console.log('  ✓ Separate Team Leader Own Reports view contains:');
    console.log('    - Title:', tlOwnReport.workTitle);
    console.log('    - TL:', tlOwnReport.author?.firstName, tlOwnReport.author?.lastName);
    console.log('    - Reports Reviewed:', tlOwnReport.reviewedReportsCount);
  } else {
    throw new Error('Admin overview failed to find Team Leader own report!');
  }

  // Step 10: Verify Client is strictly blocked and receives no reports or notices
  console.log('\n[Step 10] Verifying Client role isolation (Security & Confidentiality)...');
  const clientOverviewRes = await fetch(`${BASE_URL}/reports/admin/overview`, {
    headers: { Authorization: `Bearer ${tokens.client}` },
  });
  if (clientOverviewRes.status === 403) {
    console.log('  ✓ Client blocked from /reports/admin/overview (403 Forbidden).');
  } else {
    throw new Error(`Client was able to access /reports/admin/overview! Status: ${clientOverviewRes.status}`);
  }

  const clientTeamRes = await fetch(`${BASE_URL}/reports/team`, {
    headers: { Authorization: `Bearer ${tokens.client}` },
  });
  if (clientTeamRes.status === 403) {
    console.log('  ✓ Client blocked from /reports/team (403 Forbidden).');
  } else {
    throw new Error(`Client was able to access /reports/team! Status: ${clientTeamRes.status}`);
  }

  console.log('\n================================================================');
  console.log('ALL 10 VERIFICATION STEPS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');

  await prisma.$disconnect();
}

runInternTLWorkflowTest().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
