/**
 * Example tests showing how the error handler works
 * You can run these in your browser console to test
 */

import { handleBackendError, translateErrorMessage } from './errorHandler';

// Test 1: Common error (instant translation)
async function testCommonError() {
  const error = new Error('invalid credentials');
  const result = await handleBackendError(error);
  console.log('Common error:', result);
  // Expected: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
}

// Test 2: Unknown error (AI translation)
async function testUnknownError() {
  const error = new Error('The database connection pool is exhausted');
  const result = await handleBackendError(error);
  console.log('Unknown error:', result);
  // Expected: Arabic translation via Google Translate API
}

// Test 3: Already Arabic (no translation)
async function testArabicError() {
  const error = new Error('حدث خطأ في النظام');
  const result = await handleBackendError(error);
  console.log('Arabic error:', result);
  // Expected: "حدث خطأ في النظام" (unchanged)
}

// Test 4: Response object
async function testResponseError() {
  const mockResponse = new Response(
    JSON.stringify({ error: 'email already exists' }),
    { status: 400, headers: { 'content-type': 'application/json' } }
  );
  const result = await handleBackendError(mockResponse);
  console.log('Response error:', result);
  // Expected: "البريد الإلكتروني مستخدم بالفعل"
}

// Test 5: Complex validation error
async function testValidationError() {
  const error = {
    email: ['This field is required'],
    password: ['Password too short', 'Must contain numbers']
  };
  const result = await handleBackendError(error);
  console.log('Validation error:', result);
  // Expected: Arabic translation of field errors
}

// Run all tests
export async function runAllTests() {
  console.log('=== Error Handler Tests ===\n');
  
  await testCommonError();
  await testUnknownError();
  await testArabicError();
  await testResponseError();
  await testValidationError();
  
  console.log('\n=== Tests Complete ===');
}

// To run in browser console:
// import { runAllTests } from './errorHandler.test.example';
// runAllTests();
