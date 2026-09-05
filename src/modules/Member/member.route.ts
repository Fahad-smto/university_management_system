import { Router } from 'express';
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { MemberController } from './member.controller';
// import { MemberValidation } from './member.validation';

const router = Router();

// TODO: define Member routes here
// router.post('/', validateRequest(MemberValidation.createZod), auth('ADMIN', 'MODERATOR'), MemberController.create);
// router.get('/', MemberController.getAll);
// router.get('/:id', MemberController.getSingle);
// router.patch('/:id', validateRequest(MemberValidation.updateZod), auth('ADMIN', 'MODERATOR'), MemberController.update);
// router.delete('/:id', auth('ADMIN'), MemberController.softDelete);

export const MemberRoutes = router;
