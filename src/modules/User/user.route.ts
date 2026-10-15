import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = Router();

// '/me' অবশ্যই '/:id' এর আগে, নাহলে Express 'me' কে id মনে করবে

// ---- নিজের অ্যাকাউন্ট ----
router.get('/me', auth(), UserController.getMe);
router.patch('/me', auth(), validateRequest(UserValidation.updateMeZod), UserController.updateMe);

// ---- Admin / Super Admin ----
router.get('/', auth('ADMIN', 'SUPER_ADMIN'), UserController.getAllUsers);
router.get('/:id', auth('ADMIN', 'SUPER_ADMIN'), UserController.getSingleUser);
router.patch(
  '/:id/role',
  auth('ADMIN', 'SUPER_ADMIN'),
  validateRequest(UserValidation.changeRoleZod),
  UserController.changeUserRole,
);
router.patch(
  '/:id/block',
  auth('ADMIN', 'SUPER_ADMIN'),
  validateRequest(UserValidation.blockUserZod),
  UserController.setBlockStatus,
);
router.delete('/:id', auth('ADMIN', 'SUPER_ADMIN'), UserController.softDeleteUser);

export const UserRoutes = router;