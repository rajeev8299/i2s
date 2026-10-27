const BASE_URL = 'http://localhost:5000/api';

async function runNoticesVerification() {
  console.log('=== TEST SUITE: ADMIN MESSAGES & OFFICIAL NOTICES SYSTEM ===\n');

  const ROLES = [
    { role: 'SUPER_ADMIN', email: 'superadmin@i2s.com' },
    { role: 'ADMIN', email: 'admin@i2s.com' },
    { role: 'ACCOUNTS_MANAGER', email: 'accounts@i2s.com' },
    { role: 'HR_MANAGER', email: 'hr@i2s.com' },
    { role: 'TEAM_LEADER', email: 'teamlead@i2s.com' },
    { role: 'STAFF', email: 'staff@i2s.com' },
    { role: 'INTERN', email: 'intern@i2s.com' },
    { role: 'CLIENT', email: 'client@acmecorp.com' },
  ];

  // 1. Authenticate all roles
  console.log('[Step 1] Authenticating all 8 test accounts...');
  const tokens = {};
  for (const { role, email } of ROLES) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(`Login failed for ${role}: ${JSON.stringify(data)}`);
    }
    tokens[role] = data.token;
  }
  console.log('  ✓ All 8 roles authenticated successfully.\n');

  // 2. Unauthorized role attempting to publish notice
  console.log('[Step 2] Testing security: Non-admin (Staff) attempting to publish notice...');
  const unauthorizedPublish = await fetch(`${BASE_URL}/notifications/admin/notices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['STAFF']}`,
    },
    body: JSON.stringify({
      title: 'Fake Notice',
      content: 'This should fail',
      noticeType: 'OFFICIAL_NOTICE',
      priority: 'URGENT',
      targetType: 'ALL_ELIGIBLE',
    }),
  });
  const unauthData = await unauthorizedPublish.json();
  if (unauthorizedPublish.status === 403) {
    console.log(`  ✓ Staff publication correctly rejected with 403 Forbidden: "${unauthData.error}"\n`);
  } else {
    throw new Error(`Staff was able to publish notice! Status: ${unauthorizedPublish.status}`);
  }

  // 3. Client trying to access my-notices endpoint
  console.log('[Step 3] Testing security: Client role attempting to access /api/notifications/my-notices...');
  const clientNotices = await fetch(`${BASE_URL}/notifications/my-notices`, {
    headers: { Authorization: `Bearer ${tokens['CLIENT']}` },
  });
  const clientData = await clientNotices.json();
  if (clientNotices.status === 403) {
    console.log(`  ✓ Client access strictly rejected with 403 Forbidden: "${clientData.error}"\n`);
  } else {
    throw new Error(`Client was able to access my-notices! Status: ${clientNotices.status}`);
  }

  // 4. Admin publishing notice targeting CLIENT role (must be rejected)
  console.log('[Step 4] Testing security: Admin attempting to publish notice with CLIENT in targetRoles...');
  const clientTargetNotice = await fetch(`${BASE_URL}/notifications/admin/notices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['ADMIN']}`,
    },
    body: JSON.stringify({
      title: 'Invalid Client Notice',
      content: 'Trying to sneak client in',
      noticeType: 'OFFICIAL_NOTICE',
      priority: 'NORMAL',
      targetType: 'BY_ROLE',
      targetRoles: ['CLIENT', 'STAFF'],
    }),
  });
  const clientTargetData = await clientTargetNotice.json();
  if (clientTargetNotice.status === 400 && !clientTargetData.success) {
    console.log(`  ✓ Inclusion of CLIENT role rejected with 400 Bad Request: "${clientTargetData.error}"\n`);
  } else {
    throw new Error(`Admin was able to target CLIENT role! Status: ${clientTargetNotice.status}`);
  }

  // 5. Admin publishing official notice to ALL_ELIGIBLE (7 roles)
  console.log('[Step 5] Admin publishing official announcement to ALL_ELIGIBLE (all 7 non-client roles)...');
  const publishRes = await fetch(`${BASE_URL}/notifications/admin/notices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['ADMIN']}`,
    },
    body: JSON.stringify({
      title: 'Company-Wide Q4 Performance Townhall',
      content: 'All staff, team leaders, managers, interns, and admins are requested to join the Q4 townhall at 4:00 PM IST.',
      noticeType: 'IMPORTANT_ANNOUNCEMENT',
      priority: 'IMPORTANT',
      targetType: 'ALL_ELIGIBLE',
    }),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok || !publishData.success) {
    throw new Error(`Failed to publish notice: ${JSON.stringify(publishData)}`);
  }
  const publishedNoticeId = publishData.notice.id;
  console.log(`  ✓ Notice published successfully! Notice ID: ${publishedNoticeId}`);
  console.log(`  ✓ Recipient count: ${publishData.recipientCount} (Excludes client accounts)\n`);

  // 6. Verify each of the 7 eligible roles receives the notice
  console.log('[Step 6] Verifying all 7 eligible roles receive the notice and have unread status...');
  const eligibleRoles = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER', 'HR_MANAGER', 'TEAM_LEADER', 'STAFF', 'INTERN'];
  for (const role of eligibleRoles) {
    const res = await fetch(`${BASE_URL}/notifications/my-notices`, {
      headers: { Authorization: `Bearer ${tokens[role]}` },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(`Failed to fetch notices for ${role}: ${JSON.stringify(data)}`);
    }
    const found = data.notices.find(n => n.id === publishedNoticeId);
    if (!found) {
      throw new Error(`Notice ${publishedNoticeId} not found in inbox for role ${role}`);
    }
    if (found.isRead !== false) {
      throw new Error(`Initial read status for ${role} should be unread (isRead: false)`);
    }
    console.log(`  ✓ Role [${role}]: Received notice "${found.title}", Priority: ${found.priority}, isRead: ${found.isRead}`);
  }
  console.log('');

  // 7. Staff opens and marks the notice as read
  console.log('[Step 7] Staff opens and marks the notice as read...');
  const markReadRes = await fetch(`${BASE_URL}/notifications/my-notices/${publishedNoticeId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens['STAFF']}` },
  });
  const markReadData = await markReadRes.json();
  if (!markReadRes.ok || !markReadData.success) {
    throw new Error(`Staff failed to mark notice as read: ${JSON.stringify(markReadData)}`);
  }
  console.log(`  ✓ Staff marked notice as read. Read timestamp: ${markReadData.recipient.readAt}`);

  // Verify Staff notice is now read
  const staffCheck = await fetch(`${BASE_URL}/notifications/my-notices`, {
    headers: { Authorization: `Bearer ${tokens['STAFF']}` },
  });
  const staffData = await staffCheck.json();
  const staffNotice = staffData.notices.find(n => n.id === publishedNoticeId);
  if (!staffNotice.isRead) {
    throw new Error(`Staff notice should now be isRead: true!`);
  }
  console.log(`  ✓ Staff inbox confirmed isRead: true for notice.\n`);

  // 8. Verify Admin can view sent notices and read receipts audit
  console.log('[Step 8] Admin inspecting sent notices and recipient read receipts audit...');
  const sentNoticesRes = await fetch(`${BASE_URL}/notifications/admin/notices`, {
    headers: { Authorization: `Bearer ${tokens['ADMIN']}` },
  });
  const sentData = await sentNoticesRes.json();
  if (!sentData.success) {
    throw new Error(`Failed to fetch admin sent notices: ${JSON.stringify(sentData)}`);
  }
  const auditedNotice = sentData.notices.find(n => n.id === publishedNoticeId);
  if (!auditedNotice) {
    throw new Error(`Admin could not find published notice in sent list`);
  }
  console.log(`  ✓ Sent Notice: "${auditedNotice.title}"`);
  console.log(`  ✓ Total recipients: ${auditedNotice.totalRecipients}, Read: ${auditedNotice.readCount}, Unread: ${auditedNotice.unreadCount}`);
  
  const staffRecipient = auditedNotice.recipients.find(r => r.user.email === 'staff@i2s.com');
  if (!staffRecipient || !staffRecipient.isRead) {
    throw new Error(`Staff recipient not showing as read in Admin audit!`);
  }
  console.log(`  ✓ Read receipt confirmed in Admin panel: ${staffRecipient.user.firstName} ${staffRecipient.user.lastName} (${staffRecipient.user.role}) read at ${staffRecipient.readAt}\n`);

  // 9. Filter verification on recipient notices
  console.log('[Step 9] Verifying recipient filter capabilities (all, unread, read)...');
  const unreadFilter = await fetch(`${BASE_URL}/notifications/my-notices?filter=unread`, {
    headers: { Authorization: `Bearer ${tokens['STAFF']}` },
  });
  const unreadData = await unreadFilter.json();
  const shouldNotBeInUnread = unreadData.notices.find(n => n.id === publishedNoticeId);
  if (shouldNotBeInUnread) {
    throw new Error(`Notice was read but still appears in unread filter!`);
  }
  console.log(`  ✓ Read notice correctly filtered out of "unread" filter for Staff.`);

  const readFilter = await fetch(`${BASE_URL}/notifications/my-notices?filter=read`, {
    headers: { Authorization: `Bearer ${tokens['STAFF']}` },
  });
  const readData = await readFilter.json();
  const shouldBeInRead = readData.notices.find(n => n.id === publishedNoticeId);
  if (!shouldBeInRead) {
    throw new Error(`Notice was read but does NOT appear in "read" filter!`);
  }
  console.log(`  ✓ Read notice correctly appears in "read" filter for Staff.\n`);

  console.log('======================================================================');
  console.log('🎉 ALL NOTICES & NOTIFICATION VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================================\n');
}

runNoticesVerification().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
