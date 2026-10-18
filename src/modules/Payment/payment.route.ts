import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';

const router = Router();

// গুরুত্বপূর্ণ: '/dues', '/my', '/bkash/callback' এর মতো নির্দিষ্ট রুটগুলো '/:id' এর আগে রাখতে হবে,
// নাহলে Express 'my' বা 'dues' কেই id মনে করবে

// ---- মাসিক due ----
router.post(
  '/dues/generate',
  auth('ADMIN', 'SUPER_ADMIN'),
  validateRequest(PaymentValidation.generateDuesZod),
  PaymentController.generateMonthlyDues,
);
router.get('/dues', auth('MODERATOR', 'ADMIN', 'SUPER_ADMIN'), PaymentController.getAllDues);
router.get('/dues/my', auth(), PaymentController.getMyDues);

// ---- bKash পেমেন্ট ----
router.post(
  '/initiate',
  auth(),
  validateRequest(PaymentValidation.initiatePaymentZod),
  PaymentController.initiatePayment,
);
router.get('/bkash/callback', PaymentController.bkashCallback); // public, bKash এর redirect

// ---- পেমেন্ট ইতিহাস ----
router.get('/my', auth(), PaymentController.getMyPayments);
router.get('/', auth('ADMIN', 'SUPER_ADMIN'), PaymentController.getAllPayments);
router.get('/:id', auth(), PaymentController.getSinglePayment);
router.post('/:id/verify', auth(), PaymentController.verifyPayment);

export const PaymentRoutes = router;