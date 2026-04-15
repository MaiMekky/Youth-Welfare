/**
 * Translates backend error messages to user-friendly Arabic messages
 * Uses Google Translate API as fallback for unknown errors
 */

interface ErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
  [key: string]: any;
}

/**
 * Common error patterns mapped to Arabic (for instant translation without API call)
 */
const commonErrorMessages: Record<string, string> = {
  // Authentication errors
  'invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'authentication failed': 'فشل تسجيل الدخول',
  'unauthorized': 'غير مصرح لك بالوصول',
  'token expired': 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
  'invalid token': 'جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى',
  'not authenticated': 'يجب تسجيل الدخول أولاً',
  
  // User/Admin errors
  'user already exists': 'المستخدم موجود بالفعل',
  'email already exists': 'البريد الإلكتروني مستخدم بالفعل',
  'user not found': 'المستخدم غير موجود',
  'admin not found': 'المسؤول غير موجود',
  'duplicate email': 'البريد الإلكتروني مسجل مسبقاً',
  'invalid email': 'البريد الإلكتروني غير صالح',
  'email is required': 'البريد الإلكتروني مطلوب',
  'password is required': 'كلمة المرور مطلوبة',
  'weak password': 'كلمة المرور ضعيفة جداً',
  'password too short': 'كلمة المرور قصيرة جداً',
  'name is required': 'الاسم مطلوب',
  
  // Permission errors
  'permission denied': 'ليس لديك صلاحية للقيام بهذا الإجراء',
  'access denied': 'تم رفض الوصول',
  'forbidden': 'غير مسموح بهذا الإجراء',
  'insufficient permissions': 'صلاحياتك غير كافية',
  
  // Validation errors
  'validation error': 'خطأ في البيانات المدخلة',
  'invalid data': 'البيانات المدخلة غير صالحة',
  'required field': 'هذا الحقل مطلوب',
  'invalid format': 'صيغة البيانات غير صحيحة',
  'field is required': 'هذا الحقل مطلوب',
  
  // Department/Faculty errors
  'department not found': 'القسم غير موجود',
  'faculty not found': 'الكلية غير موجودة',
  'department already exists': 'القسم موجود بالفعل',
  'faculty already exists': 'الكلية موجودة بالفعل',
  
  // Network errors
  'network error': 'خطأ في الاتصال بالشبكة',
  'connection failed': 'فشل الاتصال بالخادم',
  'timeout': 'انتهت مهلة الاتصال',
  'server error': 'خطأ في الخادم',
  'internal server error': 'خطأ داخلي في الخادم',
  'service unavailable': 'الخدمة غير متاحة حالياً',
  
  // Database errors
  'database error': 'خطأ في قاعدة البيانات',
  'constraint violation': 'تعارض في البيانات',
  'foreign key constraint': 'لا يمكن الحذف بسبب ارتباطات موجودة',
  
  // General errors
  'bad request': 'طلب غير صالح',
  'not found': 'العنصر المطلوب غير موجود',
  'conflict': 'تعارض في البيانات',
  'failed to create': 'فشل في الإنشاء',
  'failed to update': 'فشل في التحديث',
  'failed to delete': 'فشل في الحذف',
  'operation failed': 'فشلت العملية',
  'something went wrong': 'حدث خطأ ما',
};

/**
 * Translates English text to Arabic using Google Translate API (free tier)
 */
async function translateWithGoogle(text: string): Promise<string> {
  try {
    // Using Google Translate's free endpoint (no API key needed)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation failed');
    
    const data = await response.json();
    
    // Extract translated text from response
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    
    throw new Error('Invalid translation response');
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Alternative: Use MyMemory Translation API (free, no key required)
 */
async function translateWithMyMemory(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation failed');
    
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('Invalid translation response');
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

/**
 * Extracts error message from various error response formats
 */
function extractErrorMessage(error: any): string {
  // If it's a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object
  if (error instanceof Error) {
    return error.message;
  }

  // If it's an object with common error properties
  if (typeof error === 'object' && error !== null) {
    // Check for common error message fields
    if (error.message) return error.message;
    if (error.error) return error.error;
    if (error.detail) return error.detail;
    if (error.msg) return error.msg;
    
    // Check for validation errors (array format)
    if (Array.isArray(error)) {
      return error.map(e => extractErrorMessage(e)).join(', ');
    }
    
    // Check for field-specific errors
    const fieldErrors: string[] = [];
    for (const [field, value] of Object.entries(error)) {
      if (Array.isArray(value)) {
        fieldErrors.push(`${field}: ${value.join(', ')}`);
      } else if (typeof value === 'string') {
        fieldErrors.push(`${field}: ${value}`);
      }
    }
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join('; ');
    }
  }

  return 'حدث خطأ غير متوقع';
}

/**
 * Check if text is already in Arabic
 */
function isArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}

/**
 * Translates English error message to Arabic
 * First checks common patterns, then uses translation API for unknown errors
 */
async function translateError(message: string): Promise<string> {
  // If already in Arabic, return as is
  if (isArabic(message)) {
    return message;
  }

  const lowerMessage = message.toLowerCase().trim();
  
  // Check for exact matches in common errors (instant, no API call)
  for (const [key, value] of Object.entries(commonErrorMessages)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Check for specific patterns
  if (lowerMessage.includes('email') && lowerMessage.includes('exist')) {
    return 'البريد الإلكتروني مسجل مسبقاً';
  }
  
  if (lowerMessage.includes('password') && lowerMessage.includes('incorrect')) {
    return 'كلمة المرور غير صحيحة';
  }
  
  if (lowerMessage.includes('already') && lowerMessage.includes('exist')) {
    return 'البيانات موجودة بالفعل';
  }
  
  if (lowerMessage.includes('not found')) {
    return 'العنصر المطلوب غير موجود';
  }
  
  if (lowerMessage.includes('required')) {
    return 'يرجى ملء جميع الحقول المطلوبة';
  }
  
  // If no match found, use translation API for unknown errors
  try {
    // Try Google Translate first (faster)
    const translated = await translateWithGoogle(message);
    
    // If translation looks valid (contains Arabic), return it
    if (isArabic(translated)) {
      return translated;
    }
    
    // Fallback to MyMemory if Google fails
    const fallbackTranslated = await translateWithMyMemory(message);
    if (isArabic(fallbackTranslated)) {
      return fallbackTranslated;
    }
    
    // If both fail, return generic message
    return 'حدث خطأ، يرجى المحاولة مرة أخرى';
  } catch (error) {
    console.error('Translation failed:', error);
    return 'حدث خطأ، يرجى المحاولة مرة أخرى';
  }
}

/**
 * Main function to handle and translate errors
 * @param error - The error from backend (can be Response, Error, string, or object)
 * @returns User-friendly Arabic error message
 */
export async function handleBackendError(error: any): Promise<string> {
  try {
    // If it's a Response object from fetch
    if (error instanceof Response) {
      const contentType = error.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await error.json();
          const message = extractErrorMessage(errorData);
          return await translateError(message);
        } catch {
          // If JSON parsing fails, try text
          const text = await error.text();
          return await translateError(text);
        }
      } else {
        const text = await error.text();
        return await translateError(text);
      }
    }
    
    // Extract and translate the error message
    const message = extractErrorMessage(error);
    return await translateError(message);
    
  } catch (e) {
    console.error('Error handling backend error:', e);
    return 'حدث خطأ غير متوقع';
  }
}

/**
 * Synchronous version for already extracted error messages
 * Note: This will only check common patterns, not use translation API
 */
export function translateErrorMessage(message: string): string {
  if (isArabic(message)) {
    return message;
  }

  const lowerMessage = message.toLowerCase().trim();
  
  for (const [key, value] of Object.entries(commonErrorMessages)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 'حدث خطأ، يرجى المحاولة مرة أخرى';
}

/**
 * Handle network/fetch errors specifically
 */
export function handleNetworkError(error: any): string {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'فشل الاتصال بالخادم، يرجى التحقق من الاتصال بالإنترنت';
  }
  
  if (error.name === 'AbortError') {
    return 'تم إلغاء العملية';
  }
  
  if (error.message && error.message.includes('timeout')) {
    return 'انتهت مهلة الاتصال، يرجى المحاولة مرة أخرى';
  }
  
  return 'خطأ في الاتصال بالشبكة';
}
