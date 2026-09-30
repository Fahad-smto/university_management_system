import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

// token বানানোর ফাংশন — payload কে secret দিয়ে সাইন করে একটা টোকেন স্ট্রিং রিটার্ন করে
const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

// token verify করার ফাংশন — সঠিক না হলে বা মেয়াদ শেষ হলে এটা নিজে থেকেই error throw করবে
const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};

export default jwtHelpers;