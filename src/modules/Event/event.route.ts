import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { EventController } from './event.controller';
import { EventValidation } from './event.validation';

const router = Router();

// গুরুত্বপূর্ণ: '/my/registrations' অবশ্যই '/:id' এর আগে থাকতে হবে,
// নাহলে Express 'my' কে id মনে করবে

// ---- সবার জন্য ----
router.get('/', EventController.getAllEvents);

// ---- লগইন করা ইউজারের নিজের registration ----
router.get('/my/registrations', auth(), EventController.getMyRegistrations);

router.get('/:id', EventController.getSingleEvent);

// ---- Moderator / Admin ----
router.post(
  '/',
  auth('MODERATOR', 'ADMIN', 'SUPER_ADMIN'),
  validateRequest(EventValidation.createEventZod),
  EventController.createEvent,
);
router.patch(
  '/:id',
  auth('MODERATOR', 'ADMIN', 'SUPER_ADMIN'),
  validateRequest(EventValidation.updateEventZod),
  EventController.updateEvent,
);
router.patch(
  '/:id/status',
  auth('MODERATOR', 'ADMIN', 'SUPER_ADMIN'),
  validateRequest(EventValidation.updateStatusZod),
  EventController.updateEventStatus,
);
router.get(
  '/:id/registrations',
  auth('MODERATOR', 'ADMIN', 'SUPER_ADMIN'),
  EventController.getRegistrations,
);

 
// ---- ----
router.delete('/:id', auth('MODERATOR','ADMIN', 'SUPER_ADMIN'), EventController.softDeleteEvent);

// ---- Member registration ----
router.post('/:id/register', auth(), EventController.registerForEvent);
router.delete('/:id/register', auth(), EventController.cancelRegistration);

export const EventRoutes = router;