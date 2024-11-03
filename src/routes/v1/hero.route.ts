import { Router } from 'express';
import { heroController, heroValidation } from '../../modules/heroSection';
import { auth } from '../../modules/auth';
import { validate } from '../../modules/validate';

const router: Router = Router();

router.route('/').post(auth(), heroController.createHero).get(auth(), heroController.getAllHeros);

router
  .route('/:heroId')
  .patch(auth(), validate(heroValidation.updateHeroSectionValidation), heroController.updateHero)
  .get(auth(), heroController.getHero)
  .delete(auth(), validate(heroValidation.deleteHeroSectionValidation), heroController.deleteHero);

export default router;
