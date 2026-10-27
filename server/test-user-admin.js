const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== TEST SUITE: ONE COMMON LOGIN + ADMIN USER MANAGEMENT + 8 ROLES ===\n');

  // 1. Log in all 8 roles with the common login endpoint
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

  console.log('[Test 1] Authenticating all 8 roles via ONE common endpoint (/api/auth/login)...');
  const tokens = {};
  for (const { role, email } of ROLES) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' }),
    });
    const data = await res.json();
    if (!data.success || data.user.role !== role) {
      throw new Error(`Failed to log in ${role} with ${email}: ${JSON.stringify(data)}`);
    }
    tokens[role] = data.token;
    console.log(`  ✓ ${role} successfully authenticated -> received role: ${data.user.role}`);
  }

  // 2. Test Invalid Credentials
  console.log('\n[Test 2] Verifying invalid credentials rejected...');
  const invalidRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@i2s.com', password: 'WrongPassword123!' }),
  });
  const invalidData = await invalidRes.json();
  if (invalidRes.status === 401 && !invalidData.success) {
    console.log(`  ✓ Invalid credentials correctly returned 401: "${invalidData.error}"`);
  } else {
    throw new Error(`Invalid credentials did not return 401: ${JSON.stringify(invalidData)}`);
  }

  // 3. Admin creates a new user account with temporary password
  console.log('\n[Test 3] Admin creating a new user account...');
  const testEmail = `test.employee.${Date.now()}@i2s.com`;
  const createRes = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['ADMIN']}`,
    },
    body: JSON.stringify({
      email: testEmail,
      password: 'TempPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'STAFF',
      phone: '+91 99999 11111',
      designation: 'Junior Developer',
      baseSalary: 50000,
    }),
  });
  const createData = await createRes.json();
  if (!createData.success || !createData.user.id) {
    throw new Error(`Admin user creation failed: ${JSON.stringify(createData)}`);
  }
  const createdUserId = createData.user.id;
  console.log(`  ✓ Created user ${testEmail} (ID: ${createdUserId}, Role: ${createData.user.role})`);

  // Verify new user can log in with temporary password
  console.log('\n[Test 4] New user authenticating via common login...');
  const newUserLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'TempPassword123!' }),
  });
  const newUserData = await newUserLogin.json();
  if (!newUserData.success || newUserData.user.email !== testEmail) {
    throw new Error(`New user failed to login: ${JSON.stringify(newUserData)}`);
  }
  console.log(`  ✓ New user logged in successfully.`);

  // 4. Regular Admin attempts to create or elevate to Super Admin (must be forbidden)
  console.log('\n[Test 5] Privilege Escalation Guard: Regular Admin creating Super Admin account...');
  const escalateRes = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['ADMIN']}`,
    },
    body: JSON.stringify({
      email: `bad.admin.${Date.now()}@i2s.com`,
      password: 'Password123!',
      firstName: 'Bad',
      lastName: 'Actor',
      role: 'SUPER_ADMIN',
    }),
  });
  const escalateData = await escalateRes.json();
  if (escalateRes.status === 403 && !escalateData.success) {
    console.log(`  ✓ Escalation properly blocked with 403: "${escalateData.error}"`);
  } else {
    throw new Error(`Escalation not blocked! Response: ${JSON.stringify(escalateData)}`);
  }

  // 5. Account Deactivation & Login Block
  console.log('\n[Test 6] Admin deactivates account -> verifying login is blocked...');
  const deactivateRes = await fetch(`${BASE_URL}/users/${createdUserId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['ADMIN']}`,
    },
    body: JSON.stringify({ isActive: false }),
  });
  const deactivateData = await deactivateRes.json();
  if (!deactivateData.success || deactivateData.user.isActive !== false) {
    throw new Error(`Failed to deactivate account: ${JSON.stringify(deactivateData)}`);
  }
  console.log(`  ✓ Account status updated to isActive: false`);

  const blockedLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'TempPassword123!' }),
  });
  const blockedData = await blockedLogin.json();
  if (blockedLogin.status === 403 && !blockedData.success) {
    console.log(`  ✓ Blocked deactivated account with 403: "${blockedData.error}"`);
  } else {
    throw new Error(`Deactivated account was able to log in! ${JSON.stringify(blockedData)}`);
  }

  // Reactivate
  console.log('\n[Test 7] Reactivating account...');
  await fetch(`${BASE_URL}/users/${createdUserId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['ADMIN']}`,
    },
    body: JSON.stringify({ isActive: true }),
  });
  console.log(`  ✓ Account reactivated.`);

  // 6. Admin Resets User Password
  console.log('\n[Test 8] Admin resets user password...');
  const resetRes = await fetch(`${BASE_URL}/users/${createdUserId}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['ADMIN']}`,
    },
    body: JSON.stringify({ newPassword: 'NewSecurePassword123!' }),
  });
  const resetData = await resetRes.json();
  if (!resetData.success) {
    throw new Error(`Admin password reset failed: ${JSON.stringify(resetData)}`);
  }
  console.log(`  ✓ Password successfully reset.`);

  // Verify login with new password and rejection of old password
  const oldPassLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'TempPassword123!' }),
  });
  if (oldPassLogin.status === 401) {
    console.log(`  ✓ Old password rejected with 401.`);
  } else {
    throw new Error(`Old password unexpectedly worked!`);
  }

  const newPassLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'NewSecurePassword123!' }),
  });
  const newPassData = await newPassLogin.json();
  if (newPassData.success) {
    console.log(`  ✓ Logged in successfully with newly reset password.`);
  } else {
    throw new Error(`Login with new password failed: ${JSON.stringify(newPassData)}`);
  }

  // 7. Test RBAC URL & API Endpoint Isolation
  console.log('\n[Test 9] Server-side RBAC: Verifying unauthorized API access is blocked...');

  // Staff attempts to access Admin User list
  const staffAccessUsers = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${tokens['STAFF']}` },
  });
  if (staffAccessUsers.status === 403) {
    console.log(`  ✓ Staff accessing Admin User Management blocked with 403.`);
  } else {
    throw new Error(`Staff inappropriately allowed to access users list! Status: ${staffAccessUsers.status}`);
  }

  // Client attempts to access Internal Finance Reports
  const clientAccessFinance = await fetch(`${BASE_URL}/finance/reports`, {
    headers: { Authorization: `Bearer ${tokens['CLIENT']}` },
  });
  if (clientAccessFinance.status === 403) {
    console.log(`  ✓ Client accessing Internal Finance Reports blocked with 403.`);
  } else {
    throw new Error(`Client inappropriately allowed to access finance reports! Status: ${clientAccessFinance.status}`);
  }

  // Intern attempts to access Team Review Queue
  const internReviewReport = await fetch(`${BASE_URL}/reports/team`, {
    headers: { Authorization: `Bearer ${tokens['INTERN']}` },
  });
  if (internReviewReport.status === 403) {
    console.log(`  ✓ Intern attempting to access Team Review Queue blocked with 403.`);
  } else {
    throw new Error(`Intern inappropriately allowed to review team queue! Status: ${internReviewReport.status}`);
  }

  console.log('\n================================================================');
  console.log('>>> ALL VERIFICATION TESTS PASSED SUCCESSFULLY (100%) <<<');
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
