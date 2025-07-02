/* eslint-disable no-process-env */

// Utility to throw if a required environment variable is missing
const throwIfMissing = (name: string) => {
    if (!process.env[name]) {
      throw new Error(`Missing environment variable: ${name}`);
    }
  };
  
  // List of required variables
  [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'EMAIL_SERVER',
    'EMAIL_FROM',
  ].forEach(throwIfMissing);
  
  // Export validated variables
  export const env = {
    DATABASE_URL: process.env.DATABASE_URL as string,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL as string,
    EMAIL_SERVER: process.env.EMAIL_SERVER as string,
    EMAIL_FROM: process.env.EMAIL_FROM as string,
  };
  