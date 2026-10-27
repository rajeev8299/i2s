const BASE_URL = 'http://localhost:5000/api';

async function runAttendanceVerification() {
  console.log('=== TEST SUITE: ATTENDANCE SYSTEM FOR 7 ROLES (CLIENT EXCLUDED) ===\n');

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

  // 2. Verify Client role is strictly blocked from attendance APIs
  console.log('[Step 2] Verifying Client role is BLOCKED from all attendance endpoints...');
  
  // Client check-in attempt
  const clientCheckIn = await fetch(`${BASE_URL}/hr/attendance/check-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens['CLIENT']}` },
  });
  const clientCheckInData = await clientCheckIn.json();
  if (clientCheckIn.status === 403 && !clientCheckInData.success) {
    console.log(`  ✓ Client check-in blocked with 403: "${clientCheckInData.error}"`);
  } else {
    throw new Error(`Client was able to check in! Status: ${clientCheckIn.status}`);
  }

  // Client check-out attempt
  const clientCheckOut = await fetch(`${BASE_URL}/hr/attendance/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens['CLIENT']}` },
  });
  const clientCheckOutData = await clientCheckOut.json();
  if (clientCheckOut.status === 403 && !clientCheckOutData.success) {
    console.log(`  ✓ Client check-out blocked with 403: "${clientCheckOutData.error}"`);
  } else {
    throw new Error(`Client was able to check out! Status: ${clientCheckOut.status}`);
  }

  // Client view attendance attempt
  const clientGetAtt = await fetch(`${BASE_URL}/hr/attendance`, {
    headers: { Authorization: `Bearer ${tokens['CLIENT']}` },
  });
  const clientGetAttData = await clientGetAtt.json();
  if (clientGetAtt.status === 403 && !clientGetAttData.success) {
    console.log(`  ✓ Client viewing attendance blocked with 403: "${clientGetAttData.error}"`);
  } else {
    throw new Error(`Client was able to fetch attendance! Status: ${clientGetAtt.status}`);
  }

  // 3. Verify all 7 roles can retrieve attendance history
  console.log('\n[Step 3] Verifying all 7 Employee/Admin roles can view their attendance...');
  const EMPLOYEE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER', 'HR_MANAGER', 'TEAM_LEADER', 'STAFF', 'INTERN'];
  
  for (const role of EMPLOYEE_ROLES) {
    const res = await fetch(`${BASE_URL}/hr/attendance`, {
      headers: { Authorization: `Bearer ${tokens[role]}` },
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.attendance)) {
      console.log(`  ✓ ${role} successfully retrieved attendance list (${data.attendance.length} records)`);
    } else {
      throw new Error(`${role} failed to access attendance: Status ${res.status}`);
    }
  }

  // 4. Test Check-In, Duplicate Check-In, and Check-Out lifecycle on a test employee
  console.log('\n[Step 4] Testing Attendance Check-In / Check-Out lifecycle with validations...');
  // Create a clean test user to test clean state check-in
  const testEmail = `attendance.tester.${Date.now()}@i2s.com`;
  const createUser = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens['ADMIN']}`,
    },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123!',
      firstName: 'Attendance',
      lastName: 'Tester',
      role: 'STAFF',
      designation: 'QA Tester',
    }),
  });
  const userData = await createUser.json();
  if (!userData.success) throw new Error(`Failed to create test user: ${JSON.stringify(userData)}`);

  // Log in as test user
  const testerLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Password123!' }),
  });
  const testerData = await testerLogin.json();
  const testerToken = testerData.token;

  // A. Check-Out before Check-In (Must fail)
  const prematureCheckOut = await fetch(`${BASE_URL}/hr/attendance/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${testerToken}` },
  });
  const prematureData = await prematureCheckOut.json();
  if (prematureCheckOut.status === 400 && !prematureData.success) {
    console.log(`  ✓ Check-Out before Check-In rejected with 400: "${prematureData.error}"`);
  } else {
    throw new Error(`Premature check-out was permitted: ${JSON.stringify(prematureData)}`);
  }

  // B. Check-In (Must succeed)
  const validCheckIn = await fetch(`${BASE_URL}/hr/attendance/check-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${testerToken}` },
  });
  const checkInData = await validCheckIn.json();
  if (validCheckIn.status === 200 && checkInData.success && checkInData.record.checkInTime) {
    console.log(`  ✓ Check-In succeeded -> Timestamp: ${checkInData.record.checkInTime}`);
  } else {
    throw new Error(`Check-In failed: ${JSON.stringify(checkInData)}`);
  }

  // C. Duplicate Check-In (Must fail)
  const duplicateCheckIn = await fetch(`${BASE_URL}/hr/attendance/check-in`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${testerToken}` },
  });
  const duplicateData = await duplicateCheckIn.json();
  if (duplicateCheckIn.status === 400 && !duplicateData.success) {
    console.log(`  ✓ Duplicate Check-In rejected with 400: "${duplicateData.error}"`);
  } else {
    throw new Error(`Duplicate check-in was permitted! ${JSON.stringify(duplicateData)}`);
  }

  // D. Check-Out (Must succeed)
  const validCheckOut = await fetch(`${BASE_URL}/hr/attendance/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${testerToken}` },
  });
  const checkOutData = await validCheckOut.json();
  if (validCheckOut.status === 200 && checkOutData.success && checkOutData.record.checkOutTime) {
    console.log(`  ✓ Check-Out succeeded -> Timestamp: ${checkOutData.record.checkOutTime}`);
  } else {
    throw new Error(`Check-Out failed: ${JSON.stringify(checkOutData)}`);
  }

  // E. Duplicate Check-Out (Must fail)
  const duplicateCheckOut = await fetch(`${BASE_URL}/hr/attendance/check-out`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${testerToken}` },
  });
  const dupOutData = await duplicateCheckOut.json();
  if (duplicateCheckOut.status === 400 && !dupOutData.success) {
    console.log(`  ✓ Duplicate Check-Out rejected with 400: "${dupOutData.error}"`);
  } else {
    throw new Error(`Duplicate check-out was permitted! ${JSON.stringify(dupOutData)}`);
  }

  // F. Verify record persists in history
  const historyCheck = await fetch(`${BASE_URL}/hr/attendance`, {
    headers: { Authorization: `Bearer ${testerToken}` },
  });
  const historyData = await historyCheck.json();
  const found = historyData.attendance.find(a => a.userId === userData.user.id);
  if (found && found.checkInTime && found.checkOutTime) {
    console.log(`  ✓ Persisted Attendance record verified in database (CheckIn: ${found.checkInTime}, CheckOut: ${found.checkOutTime})`);
  } else {
    throw new Error(`Attendance record not persisted in database query!`);
  }

  console.log('\n================================================================');
  console.log('>>> ALL ATTENDANCE TESTS PASSED SUCCESSFULLY (100%) <<<');
  console.log('================================================================');
}

runAttendanceVerification().catch((err) => {
  console.error('\n❌ Attendance test execution failed:', err);
  process.exit(1);
});
