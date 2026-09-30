// manual register এ যা যা লাগবে
export type IRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

// manual login এ যা যা লাগবে
export type ILoginPayload = {
  email: string;
  password: string;
};

// JWT এর ভিতরে যা যা থাকবে (কখনো password রাখবেন না এখানে)
export type IJwtPayload = {
  id: string;
  email: string;
  role: string;
};

// Google login payload (আপনার আগের কোড থেকে রাখা হলো)
export type IgoogleLoginpayload = {
  idToken: string;
};