export type IRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type ILoginPayload = {
  email: string;
  password: string;
};

export type IJwtPayload = {
  id: string;
  email: string;
  role: string;
};

export type IgoogleLoginpayload = {
  idToken: string;
};

export type IForgotPasswordPayload = {
  email: string;
};

export type IResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

// changePassword এ OTP লাগছে না — তাই শুধু old/new password আর userId
export type IChangePasswordPayload = {
  userId: string;
  oldPassword: string;
  newPassword: string;
};