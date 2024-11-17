import express, { Router } from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import heroRoute from './hero.route';
import instagramRoute from './instagram.route';
import analyticsRoute from './analytics.route';

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/hero',
    route: heroRoute,
  },
  {
    path: '/instagram',
    route: instagramRoute,
  },
  {
    path: '/analytics',
    route: analyticsRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
