import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import uploadSingleImage from '../../middlewares/upload';

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


// ---- প্রোফাইল ছবি (সব role এর জন্য) ----
// auth আগে, তাই লগইন ছাড়া কেউ ছবি আপলোড করতে পারে না
router.patch('/me/profile-image', auth(), uploadSingleImage, UserController.updateProfileImage);
router.delete('/me/profile-image', auth(), UserController.deleteProfileImage);


export const UserRoutes = router;