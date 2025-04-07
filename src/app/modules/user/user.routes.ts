import express from 'express';
import auth from '../../middlewares/auth';
import { UserControllers } from './user.controller';
import { UserRoleEnum as Role } from '@prisma/client';
import { fileUploader } from '../../middlewares/fileUploader';
import parseBodyData from '../../middlewares/parseBodyData';
const router = express.Router();

router.post('/create-needer', UserControllers.createNeeder);
router.post('/create-helper', UserControllers.createHelper);
router.get(
  '/',
  auth(Role.SUPER_ADMIN),
  UserControllers.getAllUsers
);

router.get('/me', auth(), UserControllers.getMyProfile);

router.get('/:id', auth(), UserControllers.getUserDetails);
router.put(
  '/update-profile',
  auth('USER', 'ADMIN'),
  fileUploader.uploadProfileImage,
  parseBodyData,
  UserControllers.updateMyProfile
);

router.put(
  '/update-user/:id',
  auth('ADMIN'),
  UserControllers.updateUserRoleStatus
);

export const UserRouters = router;
