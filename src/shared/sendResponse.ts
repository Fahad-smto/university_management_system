import type { Response } from "express";

type IApiResponse<T> = {
	statusCode: number;
	success: boolean;
	message?: string;
	meta?: {
		page: number;
		limit: number;
		total: number;
	};
	data?: T;
};

// Standardized success response shape used across every module
const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
	const responseData: Partial<IApiResponse<T>> = {
		success: data.success,
		message: data.message,
		meta: data.meta,
		data: data.data,
	};
	res.status(data.statusCode).json(responseData);
};

export default sendResponse;
