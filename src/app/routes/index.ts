import express from 'express';
import { AuthRouters } from '../modules/auth/auth.routes';

import { UserRouters } from '../modules/user/user.routes';
import { ServiceRouters } from '../modules/service/service.routes';



const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  {
    path: '/services',
    route: ServiceRouters,
  },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
