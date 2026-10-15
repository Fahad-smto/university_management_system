import { Router } from 'express';
import auth from '../../middlewares/auth';
import optionalAuth from '../../middlewares/optionalAuth';
import validateRequest from '../../middlewares/validateRequest';
import { ModeratorController } from './moderator.controller';
import { ModeratorValidation } from './moderator.validation';

const router = Router();

// ---- সবার জন্য ----
router.get('/', ModeratorController.getAllModerators);
router.get('/:id', optionalAuth, ModeratorController.getSingleModerator);

// ---- সদস্য ম্যানেজ (Admin) — '/members/...' রুট গুলো আগে রাখা হয়েছে ----
router.patch(
  '/members/:memberId',
  auth('ADMIN', 'SUPER_ADMIN'),
  validateRequest(ModeratorValidation.updateMemberZod),
  ModeratorController.updateMember,
);
router.delete('/members/:memberId', auth('ADMIN', 'SUPER_ADMIN'), ModeratorController.removeMember);

// ---- Panel ম্যানেজ (Admin) ----
router.post(
  '/',
  auth('ADMIN', 'SUPER_ADMIN'),
  validateRequest(ModeratorValidation.createModeratorZod),
  ModeratorController.createModerator,
);
router.patch(
  '/:id',
  auth('ADMIN', 'SUPER_ADMIN'),
  validateRequest(ModeratorValidation.updateModeratorZod),
  ModeratorController.updateModerator,
);
router.patch(
  '/:id/status',
  auth('ADMIN', 'SUPER_ADMIN'),
  validateRequest(ModeratorValidation.updateStatusZod),
  ModeratorController.updateModeratorStatus,
);
router.delete('/:id', auth('ADMIN', 'SUPER_ADMIN'), ModeratorController.softDeleteModerator);
router.post(
  '/:id/members',
  auth('ADMIN', 'SUPER_ADMIN'),
  validateRequest(ModeratorValidation.addMemberZod),
  ModeratorController.addMember,
);

export const ModeratorRoutes = router;