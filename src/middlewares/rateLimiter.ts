import rateLimit from "express-rate-limit";

// TODO: tune window/limit per sensitive route (e.g. stricter on /auth/login)
export const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many requests, please try again later.",
		errors: [],
	},
});

export default rateLimiter;
