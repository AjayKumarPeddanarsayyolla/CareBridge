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

async function runSOSTests() {
  console.log('[Test Suite] Running Milestone 5 Emergency SOS System Tests...');
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

  // 1. Authenticate Patient and Guardian
  const patientAuth = await request('POST', '/api/auth/login', {
    email: 'john.doe@carebridge.com',
    password: 'Patient@123'
  });
  const patientToken = patientAuth.body.token;

  const guardianAuth = await request('POST', '/api/auth/login', {
    email: 'mary.doe@carebridge.com',
    password: 'Family@123'
  });
  const guardianToken = guardianAuth.body.token;

  assert(Boolean(patientToken && guardianToken), 'Patient and Guardian authenticated');

  // 2. Public emergency hotlines and warnings
  const warningsRes = await request('GET', '/api/emergency/warnings');
  assert(
    warningsRes.status === 200 && Array.isArray(warningsRes.body.data.emergencyHotlines),
    `Emergency warnings returned ${warningsRes.body.data.emergencyHotlines.length} international hotline regions`
  );

  // 3. Trigger Emergency SOS
  const triggerRes = await request(
    'POST',
    '/api/emergency/sos',
    {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'Market St & 4th, San Francisco, CA',
      notes: 'Severe acute chest pressure, difficulty speaking.'
    },
    patientToken
  );
  assert(
    triggerRes.status === 201 && triggerRes.body.data.status === 'ACTIVE',
    `Emergency SOS created with status ACTIVE and ID ${triggerRes.body.data?.id}`
  );
  const alertId = triggerRes.body.data.id;

  // 4. Verify Recipients & Simulated Outbox Delivery
  const recipients = triggerRes.body.data.recipients || [];
  assert(
    recipients.length > 0,
    `Recipients identified: ${recipients.length} contact(s) notified`
  );

  const firstDelivery = recipients[0]?.deliveries?.[0];
  assert(
    firstDelivery?.status === 'SIMULATED' && firstDelivery?.channel === 'SIMULATED_SMS',
    `Outbox delivery logged with status: ${firstDelivery?.status} on channel: ${firstDelivery?.channel}`
  );

  // 5. Query active SOS
  const activeSOS = await request('GET', '/api/emergency/sos/active', null, patientToken);
  assert(
    activeSOS.status === 200 && activeSOS.body.data?.id === alertId,
    'Active SOS alert retrieved by patient'
  );

  // 6. Guardian acknowledges the SOS alert
  const ackRes = await request('POST', `/api/emergency/sos/${alertId}/acknowledge`, {}, guardianToken);
  assert(
    ackRes.status === 200 && ackRes.body.data.status === 'ACKNOWLEDGED',
    'Guardian acknowledged the SOS alert; state transitioned to ACKNOWLEDGED'
  );

  // 7. Patient resolves the SOS alert
  const resolveRes = await request(
    'POST',
    `/api/emergency/sos/${alertId}/resolve`,
    { resolutionNotes: 'Paramedics arrived on scene. Patient stabilized.' },
    patientToken
  );
  assert(
    resolveRes.status === 200 && resolveRes.body.data.status === 'RESOLVED',
    'Patient marked SOS alert as RESOLVED'
  );

  // 8. SOS History
  const historyRes = await request('GET', '/api/emergency/sos/history', null, patientToken);
  assert(
    historyRes.status === 200 && Array.isArray(historyRes.body.data) && historyRes.body.data.length > 0,
    `SOS history retrieved ${historyRes.body.data.length} historical alert(s)`
  );

  console.log(`\n[Results] ${passed}/${total} Milestone 5 Emergency SOS Tests Passed.`);
  if (passed === total) {
    console.log('[SUCCESS] Milestone 5 Emergency SOS System Fully Satisfied!\n');
    process.exit(0);
  } else {
    console.error('[FAILURE] Some tests failed.\n');
    process.exit(1);
  }
}

runSOSTests().catch((err) => {
  console.error('[Test Error]', err);
  process.exit(1);
});
