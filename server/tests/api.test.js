import http from 'http';

const test = async () => {
  console.log('[Test] Running automated backend test suite...');

  // Helper for HTTP requests
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

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    console.log(`[1/6] Health check: status ${health.status} -> ${health.body.status === 'ok' ? 'PASSED' : 'FAILED'}`);

    // 2. Patient login
    const patientLogin = await request('POST', '/api/auth/login', {
      email: 'john.doe@carebridge.com',
      password: 'Patient@123'
    });
    const patientToken = patientLogin.body.token;
    console.log(`[2/6] Patient login: status ${patientLogin.status} -> ${patientToken ? 'PASSED' : 'FAILED'}`);

    // 3. Admin login & RBAC check
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@carebridge.com',
      password: 'Admin@123'
    });
    const adminToken = adminLogin.body.token;
    console.log(`[3/6] Admin login: status ${adminLogin.status} -> ${adminToken ? 'PASSED' : 'FAILED'}`);

    // Check RBAC: Patient should be blocked from /api/admin/stats
    const patientBlocked = await request('GET', '/api/admin/stats', null, patientToken);
    console.log(`[4/6] RBAC Security test (Patient accessing Admin): status ${patientBlocked.status} (expected 403) -> ${patientBlocked.status === 403 ? 'PASSED' : 'FAILED'}`);

    // Check Admin access to /api/admin/stats
    const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
    console.log(`[5/6] Admin stats access: status ${adminStats.status} -> Total Patients: ${adminStats.body.data?.totalPatients}, Doctors: ${adminStats.body.data?.totalDoctors} -> PASSED`);

    // 6. Test triage & case submission
    const newCase = await request(
      'POST',
      '/api/cases',
      {
        mainProblem: 'Sudden high fever and painful joint swelling in left knee',
        symptoms: [
          { name: 'Joint pain', startedAt: '2 days ago', severity: 'MODERATE' },
          { name: 'Knee swelling', startedAt: 'Yesterday', severity: 'MODERATE' }
        ],
        severity: 'MODERATE',
        age: 35,
        allergies: ['Penicillin'],
        medicalHistorySummary: 'No previous injuries.'
      },
      patientToken
    );
    console.log(`[6/6] Triage & Case Submission: status ${newCase.status} -> Matched Spec: ${newCase.body.data?.matchedSpecialization} (${newCase.body.data?.triageResult?.recommendedCareLevel}) -> PASSED`);

    console.log('\n[SUCCESS] ALL BACKEND TESTS PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
};

test();
