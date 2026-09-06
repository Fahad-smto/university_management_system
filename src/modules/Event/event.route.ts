import { Router } from "express";
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import { eventController } from './event.controller';
// import { eventValidation } from './event.validation';

const router = Router();

// ---- Event routes ----
// router.post('/', validateRequest(eventValidation.createEventZod), auth('ADMIN', 'MODERATOR'), eventController.createEvent);
// router.get('/', eventController.getAllEvents);
// router.get('/:id', eventController.getSingleEvent);
// router.patch('/:id', validateRequest(eventValidation.updateEventZod), auth('ADMIN', 'MODERATOR'), eventController.updateEvent);
// router.delete('/:id', auth('ADMIN'), eventController.softDeleteEvent);

// ---- EventRegistration routes (nested under an event) ----
// router.post('/:eventId/register', auth('MEMBER'), eventController.registerForEvent);
// router.get('/:eventId/registrations', auth('ADMIN', 'MODERATOR'), eventController.getRegistrations);
// router.delete('/:eventId/register', auth('MEMBER'), eventController.cancelRegistration);

export const EventRoutes = router;
