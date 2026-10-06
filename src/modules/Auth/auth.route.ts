import { Router } from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(AuthValidation.registerZod), AuthController.register);
router.post('/login', validateRequest(AuthValidation.loginZod), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/google-login', AuthController.googleLogin);

router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPasswordZod),
  AuthController.forgotPassword,
);
router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordZod),
  AuthController.resetPassword,
);

// change-password লগইন করা ইউজারের জন্য — OTP লাগবে না, তাই auth() middleware যথেষ্ট
router.post(
  '/change-password',
  auth(),
  validateRequest(AuthValidation.changePasswordZod),
  AuthController.changePassword,
);

export const AuthRoutes = router;