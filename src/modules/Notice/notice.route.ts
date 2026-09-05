import { Router } from 'express';
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { NoticeController } from './notice.controller';
// import { NoticeValidation } from './notice.validation';

const router = Router();

// TODO: define Notice routes here
// router.post('/', validateRequest(NoticeValidation.createZod), auth('ADMIN', 'MODERATOR'), NoticeController.create);
// router.get('/', NoticeController.getAll);
// router.get('/:id', NoticeController.getSingle);
// router.patch('/:id', validateRequest(NoticeValidation.updateZod), auth('ADMIN', 'MODERATOR'), NoticeController.update);
// router.delete('/:id', auth('ADMIN'), NoticeController.softDelete);

export const NoticeRoutes = router;
