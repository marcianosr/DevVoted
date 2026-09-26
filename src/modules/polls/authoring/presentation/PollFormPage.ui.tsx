import type { ReactNode } from "react";

export type PollFormPageProps = {
	title: string;
	error?: string;
	children: ReactNode;
};

export const PollFormPage = ({ title, error, children }: PollFormPageProps) => (
	<div className="max-w-3xl mx-auto p-4">
		<h1 className="text-3xl font-bold text-theme mb-6">{title}</h1>

		{error && (
			<div className="bg-cinnabar/20 border border-cinnabar rounded-lg p-4 mb-6">
				<p className="text-cinnabar">{error}</p>
			</div>
		)}

		{children}
	</div>
);
