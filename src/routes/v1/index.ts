import express from 'express';
import authRoute from './authRoute';
import userRoute from './userRoute';
import docsRoute from './docsRoute';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/authMiddleware',
    route: authRoute
  },
  {
    path: '/users',
    route: userRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
