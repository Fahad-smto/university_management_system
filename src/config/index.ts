import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const config = {
	env: process.env.NODE_ENV,
	port: process.env.PORT || 5000,
	database_url: process.env.DATABASE_URL,
	jwt: {
		access_secret: process.env.JWT_ACCESS_SECRET,
		access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
		refresh_secret: process.env.JWT_REFRESH_SECRET,
		refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
	},
	bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
	sslcommerz: {
		store_id: process.env.SSLCOMMERZ_STORE_ID,
		store_password: process.env.SSLCOMMERZ_STORE_PASSWORD,
		is_live: process.env.SSLCOMMERZ_IS_LIVE,
		success_url: process.env.SSLCOMMERZ_SUCCESS_URL,
		fail_url: process.env.SSLCOMMERZ_FAIL_URL,
		cancel_url: process.env.SSLCOMMERZ_CANCEL_URL,
	},
};

export default config;
