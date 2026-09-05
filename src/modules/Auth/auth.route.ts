import { Router } from 'express';
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { AuthController } from './auth.controller';
// import { AuthValidation } from './auth.validation';

const router = Router();

// TODO: define Auth routes here
// router.post('/', validateRequest(AuthValidation.createZod), auth('ADMIN', 'MODERATOR'), AuthController.create);
// router.get('/', AuthController.getAll);
// router.get('/:id', AuthController.getSingle);
// router.patch('/:id', validateRequest(AuthValidation.updateZod), auth('ADMIN', 'MODERATOR'), AuthController.update);
// router.delete('/:id', auth('ADMIN'), AuthController.softDelete);

export const AuthRoutes = router;
