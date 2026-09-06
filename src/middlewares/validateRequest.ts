import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

// TODO: parse { body, query, params } against the given zod schema,
// forward validation errors to globalErrorHandler via next(error)
export const validateRequest = (schema: AnyZodObject) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// await schema.parseAsync({
			//   body: req.body,
			//   query: req.query,
			//   params: req.params,
			// });
			next();
		} catch (error) {
			next(error);
		}
	};
};

export default validateRequest;
