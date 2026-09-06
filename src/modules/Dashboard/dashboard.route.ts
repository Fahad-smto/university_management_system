import { Router } from "express";
// import auth from '../../middlewares/auth';
// import { dashboardController } from './dashboard.controller';

const router = Router();

// Public — no auth required
// router.get('/guest-dashboard', dashboardController.getGuestDashboard);

// Member/Student
// router.get('/user-dashboard', auth('MEMBER'), dashboardController.getUserDashboard);

// Moderator
// router.get('/moderator-dashboard', auth('MODERATOR'), dashboardController.getModeratorDashboard);

// Admin
// router.get('/admin-dashboard', auth('ADMIN'), dashboardController.getAdminDashboard);

export const DashboardRoutes = router;
