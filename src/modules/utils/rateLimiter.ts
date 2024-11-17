import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware for report generation endpoint.
 * Limits each user to 5 report generation requests per hour.
 */

type RateLimiterOptions = {
  windowMs: number;
  max: number;
  message: string;
};

export default function rateLimiter({ windowMs, max, message }: RateLimiterOptions) {
  return rateLimit({
    windowMs, // 1 hour window
    max, // limit each user to 5 requests per windowMs
    message,
    keyGenerator: (req) => req.user?.id || req.ip, // Rate limit based on user ID or IP
  });
}
