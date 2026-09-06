import { Router } from "express";
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { AdminController } from './admin.controller';
// import { AdminValidation } from './admin.validation';

const router = Router();

// TODO: define Admin routes here
// router.post('/', validateRequest(AdminValidation.createZod), auth('ADMIN', 'MODERATOR'), AdminController.create);
// router.get('/', AdminController.getAll);
// router.get('/:id', AdminController.getSingle);
// router.patch('/:id', validateRequest(AdminValidation.updateZod), auth('ADMIN', 'MODERATOR'), AdminController.update);
// router.delete('/:id', auth('ADMIN'), AdminController.softDelete);

export const AdminRoutes = router;
