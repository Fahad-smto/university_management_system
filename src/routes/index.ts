import { Router } from "express";

// TODO: import each module's routes as they get implemented
// import { AuthRoutes } from '../modules/Auth/auth.route';
// import { UserRoutes } from '../modules/User/user.route';
// import { SectionRoutes } from '../modules/Section/section.route';
// import { MemberRoutes } from '../modules/Member/member.route';
// import { ModeratorRoutes } from '../modules/Moderator/moderator.route';
// import { ElectionRoutes } from '../modules/Election/election.route';
// import { MonthlyDueRoutes } from '../modules/MonthlyDue/monthlyDue.route';
// import { PaymentRoutes } from '../modules/Payment/payment.route';
// import { EventRoutes } from '../modules/Event/event.route';
// import { NoticeRoutes } from '../modules/Notice/notice.route';
// import { ComplaintRoutes } from '../modules/Complaint/complaint.route';
// import { AdminRoutes } from '../modules/Admin/admin.route';
// import { DashboardRoutes } from '../modules/Dashboard/dashboard.route';

const router = Router();

const moduleRoutes: { path: string; route: Router }[] = [
	// { path: '/auth', route: AuthRoutes },
	// { path: '/users', route: UserRoutes },
	// { path: '/sections', route: SectionRoutes },
	// { path: '/members', route: MemberRoutes },
	// { path: '/moderators', route: ModeratorRoutes },
	// { path: '/elections', route: ElectionRoutes },
	// { path: '/monthly-dues', route: MonthlyDueRoutes },
	// { path: '/payments', route: PaymentRoutes },
	// { path: '/events', route: EventRoutes },
	// { path: '/notices', route: NoticeRoutes },
	// { path: '/complaints', route: ComplaintRoutes },
	// { path: '/admin', route: AdminRoutes },
	// { path: '/', route: DashboardRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
