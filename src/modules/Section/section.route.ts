import { Router } from "express";
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { SectionController } from './section.controller';
// import { SectionValidation } from './section.validation';

const router = Router();

// TODO: define Section routes here
// router.post('/', validateRequest(SectionValidation.createZod), auth('ADMIN', 'MODERATOR'), SectionController.create);
// router.get('/', SectionController.getAll);
// router.get('/:id', SectionController.getSingle);
// router.patch('/:id', validateRequest(SectionValidation.updateZod), auth('ADMIN', 'MODERATOR'), SectionController.update);
// router.delete('/:id', auth('ADMIN'), SectionController.softDelete);

export const SectionRoutes = router;
