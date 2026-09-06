import jwt, { Secret } from "jsonwebtoken";

// TODO: implement token creation and verification used by Auth module
export const jwtHelpers = {
	// createToken: (payload: Record<string, unknown>, secret: Secret, expiresIn: string): string => {
	//   return jwt.sign(payload, secret, { expiresIn });
	// },
	// verifyToken: (token: string, secret: Secret) => {
	//   return jwt.verify(token, secret);
	// },
};

export default jwtHelpers;
