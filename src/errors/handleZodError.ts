import type { ZodError } from "zod";
import type { IGenericErrorMessage } from "../interface/error";

type IGenericErrorResponse = {
	statusCode: number;
	message: string;
	errorMessages: IGenericErrorMessage[];
};

// TODO: map ZodError.issues into { path, message } entries
export const handleZodError = (error: ZodError): IGenericErrorResponse => {
	const errorMessages: IGenericErrorMessage[] = [];

	// error.issues.forEach((issue) => {
	//   errorMessages.push({
	//     path: issue.path[issue.path.length - 1],
	//     message: issue.message,
	//   });
	// });

	return {
		statusCode: 400,
		message: "Validation Error",
		errorMessages,
	};
};

export default handleZodError;
