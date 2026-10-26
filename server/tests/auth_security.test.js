import http from 'http';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runAuthSecurityTests() {
  console.log('[Test Suite] Running Milestone 3 Authentication & Security Tests...');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✔ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✖ [FAIL] ${message}`);
    }
  }

  // 1. Health check
  const health = await request('GET', '/api/health');
  assert(health.status === 200 && health.body.status === 'ok', 'Health endpoint returns 200 OK');

  // 2. Valid Patient login
  const patientRes = await request('POST', '/api/auth/login', {
    email: 'john.doe@carebridge.com',
    password: 'Patient@123'
  });
  assert(
    patientRes.status === 200 && Boolean(patientRes.body.token) && patientRes.body.user.role === 'PATIENT',
    'Patient login succeeds with JWT and PATIENT role'
  );
  const patientToken = patientRes.body.token;

  // 3. Valid Doctor login
  const docRes = await request('POST', '/api/auth/login', {
    email: 'dr.sarah@carebridge.com',
    password: 'Doctor@123'
  });
  assert(
    docRes.status === 200 && Boolean(docRes.body.token) && docRes.body.user.role === 'DOCTOR',
    'Doctor login succeeds with JWT and DOCTOR role'
  );
  const docToken = docRes.body.token;

  // 4. Valid Guardian login
  const guardianRes = await request('POST', '/api/auth/login', {
    email: 'mary.doe@carebridge.com',
    password: 'Family@123'
  });
  assert(
    guardianRes.status === 200 && Boolean(guardianRes.body.token) && guardianRes.body.user.role === 'GUARDIAN',
    'Guardian login succeeds with JWT and GUARDIAN role'
  );
  const guardianToken = guardianRes.body.token;

  // 5. Valid Admin login
  const adminRes = await request('POST', '/api/auth/login', {
    email: 'admin@carebridge.com',
    password: 'Admin@123'
  });
  assert(
    adminRes.status === 200 && Boolean(adminRes.body.token) && adminRes.body.user.role === 'ADMIN',
    'Admin login succeeds with JWT and ADMIN role'
  );
  const adminToken = adminRes.body.token;

  // 6. Invalid password
  const badPass = await request('POST', '/api/auth/login', {
    email: 'john.doe@carebridge.com',
    password: 'WrongPassword999!'
  });
  assert(badPass.status === 401, 'Invalid password rejected with 401 Unauthorized');

  // 7. Non-existent user
  const noUser = await request('POST', '/api/auth/login', {
    email: 'ghost_user_does_not_exist@example.com',
    password: 'Password@123'
  });
  assert(noUser.status === 401, 'Non-existent email rejected with 401 Unauthorized');

  // 8. Privilege Escalation Attempt: Register with role ADMIN
  const hackAdmin = await request('POST', '/api/auth/register', {
    fullName: 'Malicious Attacker',
    email: 'hacker@carebridge.com',
    mobile: '+1 (555) 000-0000',
    password: 'AttackPass@123',
    role: 'ADMIN'
  });
  assert(
    hackAdmin.status === 403,
    'Attempt to register ADMIN role blocked with 403 Forbidden'
  );

  // 9. Legitimate Patient Registration
  const testEmail = `newpatient_${Date.now()}@test.com`;
  const regPatient = await request('POST', '/api/auth/register', {
    fullName: 'Alice Walker',
    email: testEmail,
    mobile: '+1 (555) 321-7654',
    password: 'NewPatient@123',
    role: 'PATIENT',
    dateOfBirth: '1992-06-15',
    gender: 'FEMALE',
    bloodGroup: 'O+'
  });
  assert(
    regPatient.status === 201 && Boolean(regPatient.body.token),
    'Legitimate patient registration succeeds with 201 Created and JWT'
  );

  // 10. Authenticated /api/auth/me
  const meRes = await request('GET', '/api/auth/me', null, patientToken);
  assert(
    meRes.status === 200 && meRes.body.user.email === 'john.doe@carebridge.com',
    'Authenticated /api/auth/me returns patient profile details'
  );

  // 11. Unauthenticated /api/auth/me
  const unauthMe = await request('GET', '/api/auth/me');
  assert(
    unauthMe.status === 401,
    'Unauthenticated /api/auth/me correctly rejected with 401 Unauthorized'
  );

  console.log(`\n[Results] ${passed}/${total} Authentication & Security Tests Passed.`);
  if (passed === total) {
    console.log('[SUCCESS] Milestone 3 Authentication & Security Requirements Fully Satisfied!\n');
    process.exit(0);
  } else {
    console.error('[FAILURE] Some tests failed.\n');
    process.exit(1);
  }
}

runAuthSecurityTests().catch((err) => {
  console.error('[Test Error]', err);
  process.exit(1);
});
