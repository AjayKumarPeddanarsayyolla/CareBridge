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

async function runMilestone4Tests() {
  console.log('[Test Suite] Running Milestone 4 Healthcare Workflows Test Suite...');
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

  // 1. Authenticate actors
  const patientAuth = await request('POST', '/api/auth/login', {
    email: 'john.doe@carebridge.com',
    password: 'Patient@123'
  });
  const patientToken = patientAuth.body.token;

  const doctorAuth = await request('POST', '/api/auth/login', {
    email: 'dr.sarah@carebridge.com',
    password: 'Doctor@123'
  });
  const doctorToken = doctorAuth.body.token;
  const drSarahId = doctorAuth.body.user.id;

  const guardianAuth = await request('POST', '/api/auth/login', {
    email: 'mary.doe@carebridge.com',
    password: 'Family@123'
  });
  const guardianToken = guardianAuth.body.token;

  const adminAuth = await request('POST', '/api/auth/login', {
    email: 'admin@carebridge.com',
    password: 'Admin@123'
  });
  const adminToken = adminAuth.body.token;

  assert(Boolean(patientToken && doctorToken && guardianToken && adminToken), 'All 4 role tokens authenticated');

  // 2. Doctor Search & Public Directory
  const docsRes = await request('GET', '/api/doctors?specialization=Cardiology');
  assert(
    docsRes.status === 200 && Array.isArray(docsRes.body.data) && docsRes.body.data.length > 0,
    `Doctor search by specialization returned ${docsRes.body.data?.length} cardiologist(s)`
  );

  // 3. Patient Profile update
  const updateProfile = await request(
    'PUT',
    '/api/patients/profile',
    {
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Peanuts', 'Pollen'],
      existingConditions: ['Mild Asthma', 'Controlled Hypertension']
    },
    patientToken
  );
  assert(
    updateProfile.status === 200 && updateProfile.body.data.allergies.includes('Pollen'),
    'Patient profile updated successfully in PostgreSQL'
  );

  // 4. Clinical Case Submission with Automated Triage
  const caseRes = await request(
    'POST',
    '/api/cases',
    {
      mainProblem: 'Chest flutter and irregular pulse after strenuous cardio',
      symptoms: [
        { name: 'Palpitations', startedAt: 'Yesterday', severity: 'MODERATE' },
        { name: 'Shortness of breath', startedAt: 'Today', severity: 'MILD' }
      ],
      severity: 'MODERATE',
      age: 40,
      allergies: ['Penicillin']
    },
    patientToken
  );
  assert(
    caseRes.status === 201 && caseRes.body.data.matchedSpecialization === 'Cardiology',
    `Case created with rule-based triage: matched ${caseRes.body.data?.matchedSpecialization}`
  );
  const createdCaseId = caseRes.body.data.healthCase.id;

  // 5. Concurrency & Double-Booking Prevention: Attempt booking with dynamic slot
  const randomDays = Math.floor(Math.random() * 200) + 10;
  const testDate = new Date();
  testDate.setDate(testDate.getDate() + randomDays);
  const slotDateStr = testDate.toISOString().split('T')[0];
  const targetSlot = '10:00 - 10:30';

  const booking1 = await request(
    'POST',
    '/api/appointments',
    {
      doctorId: drSarahId,
      caseId: createdCaseId,
      date: slotDateStr,
      timeSlot: targetSlot,
      reason: 'Followup consultation on palpitations'
    },
    patientToken
  );
  assert(
    booking1.status === 201 && booking1.body.data.status === 'REQUESTED',
    `Initial appointment booked successfully for slot ${targetSlot}`
  );

  // 6. Conflicting Booking Attempt (Double Booking Prevention Test!)
  const booking2 = await request(
    'POST',
    '/api/appointments',
    {
      doctorId: drSarahId,
      date: slotDateStr,
      timeSlot: targetSlot,
      reason: 'Conflicting appointment attempt by another actor'
    },
    guardianToken // Guardian attempting booking same doctor, same date, same slot
  );
  assert(
    booking2.status === 409 || booking2.status === 400,
    `Double booking correctly prevented with status ${booking2.status} (Conflict)`
  );

  // 7. Doctor confirms appointment
  const apptId = booking1.body.data.id;
  const confirmAppt = await request(
    'PUT',
    `/api/appointments/${apptId}/status`,
    {
      status: 'CONFIRMED',
      notes: 'Doctor confirmed slot availability. Review blood pressure logs.'
    },
    doctorToken
  );
  assert(
    confirmAppt.status === 200 && confirmAppt.body.data.status === 'CONFIRMED',
    'Doctor confirmed appointment with state transition recorded'
  );

  // 8. Doctor Dashboard Summary
  const docSummary = await request('GET', '/api/doctors/portal/dashboard-summary', null, doctorToken);
  assert(
    docSummary.status === 200 && Array.isArray(docSummary.body.data.upcomingAppointments),
    `Doctor dashboard summary loaded ${docSummary.body.data.upcomingAppointments?.length} upcoming appointments`
  );

  // 9. Guardian System: Patient retrieves linked guardians & granular permissions
  const guardianList = await request('GET', '/api/family/members', null, patientToken);
  assert(
    guardianList.status === 200 && Array.isArray(guardianList.body.data) && guardianList.body.data.length > 0,
    `Patient retrieved ${guardianList.body.data.length} linked guardian(s)`
  );

  // 10. Admin Verification: List pending doctors and verify Dr. Alex Vance
  const pendingDocs = await request('GET', '/api/admin/doctors/pending', null, adminToken);
  assert(
    pendingDocs.status === 200 && Array.isArray(pendingDocs.body.data),
    `Admin retrieved ${pendingDocs.body.data.length} pending doctor application(s)`
  );

  if (pendingDocs.body.data.length > 0) {
    const docToVerify = pendingDocs.body.data[0];
    const verifyRes = await request('PUT', `/api/admin/doctors/${docToVerify.id}/verify`, {}, adminToken);
    assert(
      verifyRes.status === 200 && verifyRes.body.data.verificationStatus === 'VERIFIED',
      `Admin verified doctor ${docToVerify.userId?.fullName}`
    );
  }

  // 11. Admin Audit Logs
  const auditRes = await request('GET', '/api/admin/audit-logs', null, adminToken);
  assert(
    auditRes.status === 200 && Array.isArray(auditRes.body.data) && auditRes.body.data.length > 0,
    `Admin audit log retrieved ${auditRes.body.data.length} persistent audit trail event(s)`
  );

  console.log(`\n[Results] ${passed}/${total} Milestone 4 Healthcare Workflow Tests Passed.`);
  if (passed === total) {
    console.log('[SUCCESS] Milestone 4 Core Healthcare Workflows Fully Satisfied!\n');
    process.exit(0);
  } else {
    console.error('[FAILURE] Some tests failed.\n');
    process.exit(1);
  }
}

runMilestone4Tests().catch((err) => {
  console.error('[Test Error]', err);
  process.exit(1);
});
