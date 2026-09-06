import { Router } from "express";
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { ComplaintController } from './complaint.controller';
// import { ComplaintValidation } from './complaint.validation';

const router = Router();

// TODO: define Complaint routes here
// router.post('/', validateRequest(ComplaintValidation.createZod), auth('ADMIN', 'MODERATOR'), ComplaintController.create);
// router.get('/', ComplaintController.getAll);
// router.get('/:id', ComplaintController.getSingle);
// router.patch('/:id', validateRequest(ComplaintValidation.updateZod), auth('ADMIN', 'MODERATOR'), ComplaintController.update);
// router.delete('/:id', auth('ADMIN'), ComplaintController.softDelete);

export const ComplaintRoutes = router;
