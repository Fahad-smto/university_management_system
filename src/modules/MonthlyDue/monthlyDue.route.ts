import { Router } from "express";
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { MonthlyDueController } from './monthlyDue.controller';
// import { MonthlyDueValidation } from './monthlyDue.validation';

const router = Router();

// TODO: define MonthlyDue routes here
// router.post('/', validateRequest(MonthlyDueValidation.createZod), auth('ADMIN', 'MODERATOR'), MonthlyDueController.create);
// router.get('/', MonthlyDueController.getAll);
// router.get('/:id', MonthlyDueController.getSingle);
// router.patch('/:id', validateRequest(MonthlyDueValidation.updateZod), auth('ADMIN', 'MODERATOR'), MonthlyDueController.update);
// router.delete('/:id', auth('ADMIN'), MonthlyDueController.softDelete);

export const MonthlyDueRoutes = router;
