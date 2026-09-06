import { Router } from "express";
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { PaymentController } from './payment.controller';
// import { PaymentValidation } from './payment.validation';

const router = Router();

// TODO: define Payment routes here
// router.post('/', validateRequest(PaymentValidation.createZod), auth('ADMIN', 'MODERATOR'), PaymentController.create);
// router.get('/', PaymentController.getAll);
// router.get('/:id', PaymentController.getSingle);
// router.patch('/:id', validateRequest(PaymentValidation.updateZod), auth('ADMIN', 'MODERATOR'), PaymentController.update);
// router.delete('/:id', auth('ADMIN'), PaymentController.softDelete);

export const PaymentRoutes = router;
