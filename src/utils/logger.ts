// Secure logging utility that masks sensitive data
const maskSensitiveData = (data: any): any => {
  if (typeof data !== 'object' || data === null) return data;
  
  const masked = { ...data };
  const sensitiveFields = ['apiKey', 'token', 'password', 'secret'];
  
  for (const key in masked) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
};

export const logger = {
  info: (message: string, data?: any) => {
    console.log(message, data ? maskSensitiveData(data) : '');
  },
  
  error: (error: Error | string, context?: any) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const maskedContext = context ? maskSensitiveData(context) : {};
    
    console.error('Error:', errorMessage, maskedContext);
    
    // In production, you might want to send this to a logging service
    if (import.meta.env.PROD) {
      // TODO: Send to logging service
      // sendToLoggingService({ error: errorMessage, context: maskedContext });
    }
  },
  
  warn: (message: string, data?: any) => {
    console.warn(message, data ? maskSensitiveData(data) : '');
  }
}; 