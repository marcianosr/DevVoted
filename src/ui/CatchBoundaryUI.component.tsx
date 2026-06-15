import { ReactNode } from "react";

type CatchBoundaryUIProps = {
	errorDisplay: ReactNode;
	onRetry: () => void;
	navigationLink: ReactNode;
};

export const CatchBoundaryUI = ({
	errorDisplay,
	onRetry,
	navigationLink,
}: CatchBoundaryUIProps) => (
	<div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
		{errorDisplay}
		<div className="flex gap-2 items-center flex-wrap">
			<button
				onClick={onRetry}
				className="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded text-white uppercase font-extrabold"
			>
				Try Again
			</button>
			{navigationLink}
		</div>
	</div>
);
