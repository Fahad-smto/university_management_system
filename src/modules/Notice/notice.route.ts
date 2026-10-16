import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { NoticeController } from './notice.controller';
import { NoticeValidation } from './notice.validation';

const router = express.Router();

// notice দেখা: login করা যেকোনো user
router.get('/', auth(), NoticeController.getAllNotices);
router.get('/:id', auth(), NoticeController.getSingleNotice);

// তৈরি / edit / delete: Admin ও Moderator
router.post(
  '/',
  auth('SUPER_ADMIN', 'ADMIN', 'MODERATOR'),
  validateRequest(NoticeValidation.createNoticeZod),
  NoticeController.createNotice,
);

router.patch(
  '/:id',
  auth('SUPER_ADMIN', 'ADMIN', 'MODERATOR'),
  validateRequest(NoticeValidation.updateNoticeZod),
  NoticeController.updateNotice,
);

router.delete('/:id', auth('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), NoticeController.deleteNotice);

export const NoticeRoutes = router;