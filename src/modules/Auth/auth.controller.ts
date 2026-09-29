import { Request, Response } from "express";
import { AuthService } from "./auth.service";
// import catchAsync from '../../shared/catchAsync';
// import sendResponse from '../../shared/sendResponse';
// import pick from '../../shared/pick';
// import { AuthService } from './auth.service';


const googleLogin = async (_req: Request, res: Response) => {
	try {

		const payload = _req.body;
		// Call the AuthService to handle Google login logic
		const result = await AuthService.googleLogin(payload);
		res.status(200).json({
			success: true,
			message: "Google login successful",
			data: result,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Google login failed",
			error: error instanceof Error ? error.message : String(error),
		});
	}
}


// TODO: implement Auth controller functions
export const AuthController = {

	googleLogin
	// create: catchAsync(async (req: Request, res: Response) => {}),
	// getAll: catchAsync(async (req: Request, res: Response) => {}),
	// getSingle: catchAsync(async (req: Request, res: Response) => {}),
	// update: catchAsync(async (req: Request, res: Response) => {}),
	// softDelete: catchAsync(async (req: Request, res: Response) => {}),
};
