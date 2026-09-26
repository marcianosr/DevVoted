import { reportApiFailure } from "~/shared/utils/errorReporting";

export type ApiResponse<T = unknown> =
	| {
			readonly success: true;
			readonly data: T;
			readonly message?: string;
	  }
	| {
			readonly success: false;
			readonly error: string;
	  };

export const createSuccessResponse = <T>(
	data: T,
	message?: string
): ApiResponse<T> => ({
	success: true,
	data,
	...(message && { message }),
});

export const createErrorResponse = (error: unknown): ApiResponse<never> => {
	const message =
		error instanceof Error ? error.message : "Something went wrong";
	return {
		success: false,
		error: message,
	};
};

export const handleApiOperation = async <T>(
	operation: () => Promise<T>,
	operationName: string
): Promise<ApiResponse<T>> => {
	try {
		return createSuccessResponse(await operation());
	} catch (error) {
		reportApiFailure(error, operationName);
		return createErrorResponse(error);
	}
};
