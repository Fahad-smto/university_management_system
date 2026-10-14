import { Router } from 'express';
import auth from '../../middlewares/auth';
import optionalAuth from '../../middlewares/optionalAuth';
import validateRequest from '../../middlewares/validateRequest';
import { MemberController } from './member.controller';
import { MemberValidation } from './member.validation';

const router = Router();

// গুরুত্বপূর্ণ: '/public' আর '/me' রুট গুলো '/:id' এর আগে রাখতে হবে,
// নাহলে Express 'public' বা 'me' কেই id মনে করে ভুল রুটে পাঠিয়ে দেবে

// ---- Public directory (guest ও ঢুকতে পারবে) ----
router.get('/public', optionalAuth, MemberController.getPublicMembers);
router.get('/public/:id', optionalAuth, MemberController.getPublicMemberById);

// ---- নিজের profile (লগইন লাগবে) ----
router.get('/me', auth(), MemberController.getMyProfile);
router.patch(
  '/me',
  auth(),
  validateRequest(MemberValidation.updateProfileZod),
  MemberController.updateMyProfile,
);
router.post(
  '/',
  auth(),
  validateRequest(MemberValidation.createProfileZod),
  MemberController.createMyProfile,
);

// ---- Moderator/Admin এর কাজ ----
router.patch(
  '/:id/status',
  auth('MODERATOR', 'ADMIN', 'SUPER_ADMIN'),
  validateRequest(MemberValidation.updateStatusZod),
  MemberController.updateMembershipStatus,
);
router.patch(
  '/:id/section',
  auth('MODERATOR', 'ADMIN', 'SUPER_ADMIN'),
  validateRequest(MemberValidation.assignSectionZod),
  MemberController.assignSection,
);

// ---- শুধু Admin ----
router.delete('/:id', auth('ADMIN', 'SUPER_ADMIN'), MemberController.softDeleteMember);

export const MemberRoutes = router;