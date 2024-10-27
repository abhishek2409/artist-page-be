import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { authValidation, authController } from '../../modules/auth';

const router: Router = express.Router();

router.post('/signup', validate(authValidation.signup), authController.signup);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', authController.refreshTokens);

export default router;
