import { test } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:5000';

const request = async (method, path, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, body: data };
};

console.log('[Test Suite] Running Payment & Transaction Architecture Tests...');

const runPaymentTests = async () => {
  // 1. Authenticate Patient and Doctor
  const patientAuth = await request('POST', '/api/auth/login', {
    email: 'john.doe@carebridge.com',
    password: 'Patient@123'
  });
  assert.strictEqual(patientAuth.status, 200, 'Patient login successful');
  const patientToken = patientAuth.body.token;
  const patientId = patientAuth.body.user.id;

  const doctorAuth = await request('POST', '/api/auth/login', {
    email: 'dr.sarah@carebridge.com',
    password: 'Doctor@123'
  });
  assert.strictEqual(doctorAuth.status, 200, 'Doctor login successful');
  const doctorToken = doctorAuth.body.token;
  const doctorId = doctorAuth.body.user.id;

  // 2. Test Fee Calculation
  const feeRes = await request('GET', `/api/payments/fee-estimate/${doctorId}`);
  assert.strictEqual(feeRes.status, 200, 'Fee estimate retrieved');
  assert.ok(feeRes.body.data.totalAmountPaise > 0, 'Total amount calculated in paise');
  assert.ok(feeRes.body.data.gstPaise > 0, 'GST included in fee breakdown');
  console.log('  ✔ [PASS] Server-calculated consultation fee verified (GST + platform fee)');

  // 3. Book a dynamic appointment to test payment on
  const dynamicDays = Math.floor(Math.random() * 300) + 15;
  const testDate = new Date();
  testDate.setDate(testDate.getDate() + dynamicDays);
  const dateStr = testDate.toISOString().split('T')[0];
  const timeSlot = '11:00 - 11:30';

  const apptRes = await request(
    'POST',
    '/api/appointments',
    {
      doctorId,
      date: dateStr,
      timeSlot,
      reason: 'Hypertension consultation and ECG check'
    },
    patientToken
  );
  assert.strictEqual(apptRes.status, 201, 'Appointment booked in REQUESTED status');
  const appointmentId = apptRes.body.data.id;
  console.log(`  ✔ [PASS] Test appointment created: ${appointmentId}`);

  // 4. Create Payment Order
  const orderRes = await request(
    'POST',
    '/api/payments/create-order',
    {
      appointmentId,
      idempotencyKey: `idem_test_${Date.now()}`
    },
    patientToken
  );
  assert.strictEqual(orderRes.status, 201, 'Payment order created');
  assert.strictEqual(orderRes.body.data.order.status, 'PENDING', 'Order initialized in PENDING status');
  assert.strictEqual(orderRes.body.data.order.amount, feeRes.body.data.totalAmountPaise, 'Amount matches server calculation');
  const orderId = orderRes.body.data.order.id;
  console.log(`  ✔ [PASS] Payment order created: ${orderId} (Amount: ${feeRes.body.data.formattedTotal})`);

  // 5. Unauthorized User Check (Doctor cannot pay for Patient's appointment)
  const unauthOrderRes = await request(
    'POST',
    '/api/payments/create-order',
    { appointmentId },
    doctorToken
  );
  assert.strictEqual(unauthOrderRes.status, 403, 'Cross-user payment attempt blocked with 403 Forbidden');
  console.log('  ✔ [PASS] Cross-user payment attempt rejected');

  // 6. Test Simulated Payment Failure Scenario
  const failRes = await request(
    'POST',
    '/api/payments/verify',
    {
      orderId,
      scenario: 'FAILURE'
    },
    patientToken
  );
  assert.strictEqual(failRes.status, 200, 'Failure handled gracefully');
  assert.strictEqual(failRes.body.data.status, 'FAILED', 'Order correctly marked FAILED');
  console.log('  ✔ [PASS] Simulated failure scenario handled; slot unconfirmed');

  // 7. Test Simulated Payment Success Scenario
  // Re-create or resume order for success
  const newOrderRes = await request(
    'POST',
    '/api/payments/create-order',
    { appointmentId },
    patientToken
  );
  const activeOrderId = newOrderRes.body.data.order.id;

  const successRes = await request(
    'POST',
    '/api/payments/verify',
    {
      orderId: activeOrderId,
      scenario: 'SUCCESS'
    },
    patientToken
  );
  assert.strictEqual(successRes.status, 200, 'Success verified');
  assert.strictEqual(successRes.body.data.status, 'COMPLETED', 'Order status COMPLETED');
  console.log('  ✔ [PASS] Simulated payment success processed');

  // 8. Verify Appointment transitioned to CONFIRMED
  const apptCheck = await request('GET', '/api/appointments', null, patientToken);
  const foundAppt = apptCheck.body.data.find(a => a.id === appointmentId);
  assert.strictEqual(foundAppt?.status, 'CONFIRMED', 'Appointment transitioned to CONFIRMED');
  console.log('  ✔ [PASS] Appointment status confirmed in PostgreSQL');

  // 9. Idempotency Check (Duplicate Callback verification)
  const duplicateRes = await request(
    'POST',
    '/api/payments/verify',
    {
      orderId: activeOrderId,
      scenario: 'SUCCESS'
    },
    patientToken
  );
  assert.strictEqual(duplicateRes.status, 200, 'Duplicate request returned 200 OK');
  assert.strictEqual(duplicateRes.body.data.alreadyProcessed, true, 'Flagged as alreadyProcessed');
  console.log('  ✔ [PASS] Idempotent duplicate callback handled safely');

  // 10. Receipt Verification
  const receiptRes = await request('GET', `/api/payments/receipt/${activeOrderId}`, null, patientToken);
  assert.strictEqual(receiptRes.status, 200, 'Receipt fetched successfully');
  assert.strictEqual(receiptRes.body.data.status, 'COMPLETED', 'Receipt displays COMPLETED');
  assert.ok(receiptRes.body.data.doctor.name.includes('Sarah Jenkins'), 'Receipt displays correct physician');
  console.log('  ✔ [PASS] Itemized consultation receipt generated and verified');

  console.log('\n[SUCCESS] All 10 Payment & Transaction Tests Passed Cleanly!');
};

runPaymentTests().catch(err => {
  console.error('\n❌ Payment Test Error:', err);
  process.exit(1);
});
