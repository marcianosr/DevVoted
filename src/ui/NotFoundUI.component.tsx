import { ReactNode } from "react";

type NotFoundUIProps = {
	onGoBack: () => void;
	homeLink: ReactNode;
	children?: ReactNode;
};

export const NotFoundUI = ({
	onGoBack,
	homeLink,
	children,
}: NotFoundUIProps) => (
	<div className="space-y-2 p-2">
		<div className="text-gray-600 dark:text-gray-400">
			{children ?? <p>The page you are looking for does not exist.</p>}
		</div>
		<p className="flex items-center gap-2 flex-wrap">
			<button
				onClick={onGoBack}
				className="bg-emerald-500 text-white px-2 py-1 rounded uppercase font-black text-sm"
			>
				Go back
			</button>
			{homeLink}
		</p>
	</div>
);
