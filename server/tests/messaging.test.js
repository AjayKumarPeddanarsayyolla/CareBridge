import http from 'http';
import { prisma } from '../config/prisma.js';

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

async function runMessagingTests() {
  console.log('[Test Suite] Running Case Messaging with PostgreSQL & Prisma Tests...');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✔ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Authenticate patient
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'sarah.smith@carebridge.com',
      password: 'Patient@123'
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'Patient login succeeded for messaging test');
    const token = loginRes.body.token;
    const patientId = loginRes.body.user.id;

    // 2. Find or create a test case for this patient in PostgreSQL
    let healthCase = await prisma.healthCase.findFirst({
      where: { patientId }
    });

    if (!healthCase) {
      healthCase = await prisma.healthCase.create({
        data: {
          caseNumber: `CASE-MSG-${Date.now()}`,
          patientId,
          submittedById: patientId,
          mainProblem: 'Routine Follow-up',
          symptoms: [{ name: 'Mild Fatigue', severity: 'MILD' }],
          matchedSpecialization: 'General Medicine',
          severity: 'MILD'
        }
      });
    }

    assert(healthCase && healthCase.id, `HealthCase identified with ID: ${healthCase.id}`);

    // 3. Create a message directly in PostgreSQL ChatMessage model
    const createdMsg = await prisma.chatMessage.create({
      data: {
        caseId: healthCase.id,
        senderId: patientId,
        senderRole: 'PATIENT',
        content: 'Hello doctor, testing PostgreSQL persistence for case chat.',
        isRead: false
      }
    });

    assert(createdMsg && createdMsg.id, `ChatMessage successfully stored in PostgreSQL with ID: ${createdMsg.id}`);

    // 4. Retrieve messages via API endpoint /api/messages/case/:caseId
    const getRes = await request('GET', `/api/messages/case/${healthCase.id}`, null, token);
    assert(getRes.status === 200 && getRes.body.success, 'GET /api/messages/case/:caseId returned 200 OK');
    assert(Array.isArray(getRes.body.data) && getRes.body.data.length > 0, `Retrieved ${getRes.body.data.length} message(s) from PostgreSQL`);
    const found = getRes.body.data.find(m => m.id === createdMsg.id || m._id === createdMsg.id);
    assert(found && found.content === 'Hello doctor, testing PostgreSQL persistence for case chat.', 'Message content verified matching PostgreSQL record');

    // 5. Mark messages as read via API endpoint /api/messages/case/:caseId/read
    const readRes = await request('PATCH', `/api/messages/case/${healthCase.id}/read`, null, token);
    assert(readRes.status === 200 && readRes.body.success, 'PATCH /api/messages/case/:caseId/read returned 200 OK');

    console.log(`\n[Results] ${passed}/${total} Messaging Tests Passed Cleanly.`);
    await prisma.$disconnect();
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal Messaging Test Error:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runMessagingTests();
