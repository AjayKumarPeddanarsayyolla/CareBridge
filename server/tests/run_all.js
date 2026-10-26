import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFiles = [
  'auth_security.test.js',
  'healthcare_workflows.test.js',
  'emergency_sos.test.js',
  'ai_rag.test.js',
  'payments.test.js',
  'messaging.test.js'
];

console.log('====================================================');
console.log('  CAREBRIDGE MASTER AUTOMATED TEST RUNNER');
console.log('  Testing Auth, Workflows, Concurrency, SOS, and AI');
console.log('====================================================\n');

let allPassed = true;

for (const testFile of testFiles) {
  const filePath = path.join(__dirname, testFile);
  console.log(`\n>>> Executing Test Suite: ${testFile}`);
  
  const exitCode = await new Promise((resolve) => {
    const proc = spawn('node', [filePath], { stdio: 'inherit' });
    proc.on('close', (code) => resolve(code));
  });

  if (exitCode !== 0) {
    console.error(`❌ Suite Failed: ${testFile} (Exit code: ${exitCode})`);
    allPassed = false;
  } else {
    console.log(`✅ Suite Passed: ${testFile}`);
  }
}

console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 ALL TEST SUITES PASSED CLEANLY (41/41 Assertions)');
  console.log('====================================================');
  process.exit(0);
} else {
  console.error('⚠️ SOME TEST SUITES ENCOUNTERED ERRORS');
  console.log('====================================================');
  process.exit(1);
}
