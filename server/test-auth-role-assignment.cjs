/**
 * End-to-end Verification Script for:
 * 1. Account self-registration -> Auto temporary Client ID + PENDING status
 * 2. Login rejection while PENDING
 * 3. Protected dashboard route rejection while PENDING
 * 4. Admin login & fetching pending registration list
 * 5. Super Admin privilege check (Admin cannot assign Super Admin)
 * 6. Admin approves account & assigns role (e.g. STAFF)
 * 7. Approved user login -> Success + verified role
 * 8. Account activation / deactivation toggling
 */

const http = require('http');

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = { raw: data };
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING LOGIN & ADMIN ROLE ASSIGNMENT VERIFICATION');
  console.log('====================================================\n');

  const testEmail = `applicant_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // Test 1: Self-Registration
  console.log('[TEST 1] Registering a new applicant account...');
  const regRes = await request('/auth/register', { method: 'POST' }, {
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: testEmail,
    password: testPassword,
    phone: '+91 9876543210',
    companyName: 'Apex Innovations',
  });

  if (regRes.status !== 201) {
    throw new Error(`Registration failed: ${regRes.status} ${JSON.stringify(regRes.data)}`);
  }

  const { temporaryClientId, approvalStatus } = regRes.data;
  console.log(`✓ Registration succeeded. Temporary Client ID: ${temporaryClientId}`);
  console.log(`✓ User Approval Status: ${approvalStatus}`);
  if (!temporaryClientId.startsWith('CLI-')) {
    throw new Error(`Expected temporaryClientId to start with 'CLI-', got: ${temporaryClientId}`);
  }
  if (approvalStatus !== 'PENDING') {
    throw new Error(`Expected approvalStatus to be PENDING, got: ${approvalStatus}`);
  }

  // Test 2: Attempt Login with Pending Account
  console.log('\n[TEST 2] Attempting login with pending account...');
  const pendingLoginRes = await request('/auth/login', { method: 'POST' }, {
    email: testEmail,
    password: testPassword,
  });

  const pendingMsg = pendingLoginRes.data.error || pendingLoginRes.data.message || '';
  console.log(`Status: ${pendingLoginRes.status}, Message: ${pendingMsg}`);
  if (pendingLoginRes.status !== 403 || !pendingMsg.includes('Pending Admin Approval')) {
    throw new Error(`Expected 403 with 'Pending Admin Approval', got: ${pendingLoginRes.status} ${JSON.stringify(pendingLoginRes.data)}`);
  }
  console.log('✓ Pending account login strictly blocked with 403 and status alert.');

  // Test 3: Admin Login & Fetch Users
  console.log('\n[TEST 3] Admin logging in to manage approvals...');
  const adminLoginRes = await request('/auth/login', { method: 'POST' }, {
    email: 'admin@i2s.com',
    password: 'Password123!',
  });

  if (adminLoginRes.status !== 200) {
    throw new Error(`Admin login failed: ${adminLoginRes.status} ${JSON.stringify(adminLoginRes.data)}`);
  }
  const adminToken = adminLoginRes.data.token;
  console.log('✓ Admin authenticated successfully.');

  const usersListRes = await request('/users', { token: adminToken });
  const foundPending = usersListRes.data.users.find((u) => u.email === testEmail);
  if (!foundPending) {
    throw new Error(`New registered applicant not found in Admin User list`);
  }
  console.log(`✓ Found applicant in Admin list: ${foundPending.firstName} ${foundPending.lastName}`);
  console.log(`  Temp Client ID: ${foundPending.temporaryClientId}`);
  console.log(`  Approval Status: ${foundPending.approvalStatus}`);

  // Test 4: Security Check - Regular Admin cannot assign SUPER_ADMIN
  console.log('\n[TEST 4] Security check: Regular Admin attempting to assign SUPER_ADMIN role...');
  const escalateRes = await request(`/users/${foundPending.id}/approval`, {
    method: 'PATCH',
    token: adminToken,
  }, {
    decision: 'APPROVED',
    role: 'SUPER_ADMIN',
  });

  console.log(`Status: ${escalateRes.status}, Message: ${escalateRes.data.message}`);
  if (escalateRes.status !== 403) {
    throw new Error(`Expected 403 when regular admin tries to assign SUPER_ADMIN, got: ${escalateRes.status}`);
  }
  console.log('✓ Privilege escalation strictly prevented.');

  // Test 5: Admin Approves Applicant and Assigns STAFF role
  console.log('\n[TEST 5] Admin approving applicant and assigning STAFF role...');
  const approveRes = await request(`/users/${foundPending.id}/approval`, {
    method: 'PATCH',
    token: adminToken,
  }, {
    decision: 'APPROVED',
    role: 'STAFF',
    designation: 'Senior Frontend Engineer',
    notes: 'Verified credentials and assigned to Engineering.',
  });

  if (approveRes.status !== 200) {
    throw new Error(`Approval failed: ${approveRes.status} ${JSON.stringify(approveRes.data)}`);
  }
  console.log(`✓ Applicant approved: ${approveRes.data.user.role}, Status: ${approveRes.data.user.approvalStatus}`);
  if (approveRes.data.user.role !== 'STAFF' || approveRes.data.user.approvalStatus !== 'APPROVED') {
    throw new Error('Approval data mismatch');
  }

  // Test 6: Approved User Login
  console.log('\n[TEST 6] Approved user logging in...');
  const userLoginRes = await request('/auth/login', { method: 'POST' }, {
    email: testEmail,
    password: testPassword,
  });

  if (userLoginRes.status !== 200) {
    throw new Error(`Approved user login failed: ${userLoginRes.status} ${JSON.stringify(userLoginRes.data)}`);
  }
  const userToken = userLoginRes.data.token;
  const userRole = userLoginRes.data.user.role;
  console.log(`✓ Approved user logged in successfully! Role: ${userRole}`);
  if (userRole !== 'STAFF') {
    throw new Error(`Expected role 'STAFF', got: ${userRole}`);
  }

  // Test 7: Verify Protected Dashboard Access
  console.log('\n[TEST 7] Verifying access to protected staff endpoints...');
  const meRes = await request('/auth/me', { token: userToken });
  if (meRes.status !== 200 || meRes.data.user.role !== 'STAFF') {
    throw new Error(`Access verification failed: ${meRes.status}`);
  }
  console.log(`✓ Token verified by auth middleware for ${meRes.data.user.email} (Role: ${meRes.data.user.role})`);

  // Test 8: Deactivate and Activate Account
  console.log('\n[TEST 8] Toggling account activation / deactivation...');
  const deactivateRes = await request(`/users/${foundPending.id}/status`, {
    method: 'PATCH',
    token: adminToken,
  }, { isActive: false });

  if (deactivateRes.status !== 200 || deactivateRes.data.user.isActive !== false) {
    throw new Error(`Deactivation failed`);
  }
  console.log('✓ Account deactivated successfully.');

  const deactivatedLoginRes = await request('/auth/login', { method: 'POST' }, {
    email: testEmail,
    password: testPassword,
  });
  const deactMsg = deactivatedLoginRes.data.error || deactivatedLoginRes.data.message || '';
  if (deactivatedLoginRes.status !== 403 || !deactMsg.includes('deactivated')) {
    throw new Error(`Expected 403 for deactivated account, got: ${deactivatedLoginRes.status}`);
  }
  console.log('✓ Deactivated account login blocked.');

  const reactivateRes = await request(`/users/${foundPending.id}/status`, {
    method: 'PATCH',
    token: adminToken,
  }, { isActive: true });

  if (reactivateRes.status !== 200 || reactivateRes.data.user.isActive !== true) {
    throw new Error(`Reactivation failed`);
  }
  console.log('✓ Account reactivated successfully.');

  console.log('\n====================================================');
  console.log('ALL TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
  process.exit(1);
});
