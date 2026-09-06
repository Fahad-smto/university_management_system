import { Router } from "express";
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { UserController } from './user.controller';
// import { UserValidation } from './user.validation';

const router = Router();

// TODO: define User routes here
// router.post('/', validateRequest(UserValidation.createZod), auth('ADMIN', 'MODERATOR'), UserController.create);
// router.get('/', UserController.getAll);
// router.get('/:id', UserController.getSingle);
// router.patch('/:id', validateRequest(UserValidation.updateZod), auth('ADMIN', 'MODERATOR'), UserController.update);
// router.delete('/:id', auth('ADMIN'), UserController.softDelete);

export const UserRoutes = router;
