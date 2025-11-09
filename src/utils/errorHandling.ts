import * as Sentry from "@sentry/react";

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
	fallbackErrorMessage?: string
): Promise<ApiResponse<T>> => {
	try {
		const result = await operation();
		return createSuccessResponse(result);
	} catch (error) {
		Sentry.captureException(error, {
			level: "warning",
			extra: {
				operation: fallbackErrorMessage || "handleApiOperation",
			},
		});

		const message =
			error instanceof Error
				? error.message
				: fallbackErrorMessage || "Something went wrong";
		return {
			success: false,
			error: message,
		};
	}
};
