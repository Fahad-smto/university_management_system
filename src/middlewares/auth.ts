import type { NextFunction, Request, Response } from "express";

// TODO: verify JWT access token from headers/cookies,
// decode payload, attach req.user, and check role against requiredRoles
export const auth = (...requiredRoles: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// const token = req.headers.authorization;
			// if (!token) throw new ApiError(401, 'Unauthorized');
			// const verifiedUser = jwtHelpers.verifyToken(token, config.jwt.access_secret);
			// req.user = verifiedUser;
			// if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
			//   throw new ApiError(403, 'Forbidden');
			// }
			next();
		} catch (error) {
			next(error);
		}
	};
};

export default auth;
