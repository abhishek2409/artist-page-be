import express, { Router } from 'express';
import { heroController } from '../../modules/heroSection';
import { auth } from '../../modules/auth';

const router: Router = express.Router();

router.post('/', auth(), heroController.createHero).get('/', auth(), heroController.getAllHeros);

export default router;
