import { Router } from "express";
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { moderatorController } from './moderator.controller';
// import { moderatorValidation } from './moderator.validation';

const router = Router();

// ---- Moderator (panel) routes ----
// router.post('/', validateRequest(moderatorValidation.createModeratorZod), auth('ADMIN'), moderatorController.createModerator);
// router.get('/', moderatorController.getAllModerators);
// router.get('/:id', moderatorController.getSingleModerator);
// router.patch('/:id', validateRequest(moderatorValidation.updateModeratorZod), auth('ADMIN'), moderatorController.updateModerator);
// router.delete('/:id', auth('ADMIN'), moderatorController.softDeleteModerator);

// ---- ModeratorMember routes (nested under a moderator panel) ----
// router.post('/:moderatorId/members', validateRequest(moderatorValidation.addMemberZod), auth('ADMIN'), moderatorController.addMember);
// router.get('/:moderatorId/members', moderatorController.getMembers);
// router.patch('/members/:memberId', auth('ADMIN'), moderatorController.updateMember);
// router.delete('/members/:memberId', auth('ADMIN'), moderatorController.removeMember);

export const ModeratorRoutes = router;
