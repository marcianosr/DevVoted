import type { ReactNode } from "react";

import { Title } from "~/ui/typography/Title.component";

type TerminalPanelProps = {
	title: string;
	children: ReactNode;
};

export const TerminalPanel = ({ title, children }: TerminalPanelProps) => (
	<fieldset className="flex flex-col gap-4 border border-zinc-300 px-5 py-4">
		<legend className="px-2">
			<Title as="h2" className="tracking-[0.3em] text-zinc-100">
				{title}
			</Title>
		</legend>
		{children}
	</fieldset>
);

type TerminalSectionProps = {
	label: string;
	children: ReactNode;
};

export const TerminalSection = ({ label, children }: TerminalSectionProps) => (
	<div className="flex flex-col gap-2">
		<Title as="h3">{label}</Title>
		{children}
	</div>
);
