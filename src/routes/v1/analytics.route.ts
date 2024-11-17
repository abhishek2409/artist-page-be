// backend/src/routes/analytics.ts

import express from 'express';
import { auth } from '../../modules/auth';
import { rateLimiter } from '../../modules/utils';
import { analyticsController } from '../../modules/analytics';

const router = express.Router();

// POST /v1/analytics/generate
router.post(
  '/generate',
  auth(),
  rateLimiter({ windowMs: 60 * 60 * 1000, max: 1, message: 'Sorry you cant generate report more than once per hour' }),
  analyticsController.generateReport
);

// GET /v1/analytics/report/:reportId
router.get('/report/:reportId', auth(), analyticsController.getReportDetail);

export default router;
