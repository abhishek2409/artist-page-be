import express, { Router } from 'express';
import { auth } from '../../modules/auth';
import { userController } from '../../modules/user';

const router: Router = express.Router();

router.route('/').get(auth(), userController.getUser);

export default router;
