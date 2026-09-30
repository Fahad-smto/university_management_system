import { Router } from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(AuthValidation.registerZod), AuthController.register);
router.post('/login', validateRequest(AuthValidation.loginZod), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/google-login', AuthController.googleLogin);

export const AuthRoutes = router;