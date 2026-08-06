import rateLimit from 'express-rate-limit';

// Login & Register Limiter (15 Min - Max 10 Requests)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
});


// OTP Verification Limiter
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5, // Limit 5 OTP verification attempts per 5 minutes
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please wait 5 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});