import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { GateHeader } from "../GateHeader.ui";
import { Text } from "../Text.ui";
import { Verdict, type VerdictProps } from "../Verdict.ui";

const LIST = "flex flex-col divide-y divide-edge";

const FOOTER =
	"flex flex-wrap items-center gap-4 border-t border-edge px-5 py-4";

export type ReviewPoll = VerdictProps & { id: string };

export type ReviewScreenProps = {
	gateName: string;
	gate: number;
	polls: readonly ReviewPoll[];
	back?: { label: string; onUse: () => void };
	note?: ReactNode;
	theme?: SwatchTheme;
};

export const ReviewScreen = ({
	gateName,
	gate,
	polls,
	back,
	note,
	theme,
}: ReviewScreenProps) => (
	<Screen theme={theme}>
		<GateHeader title={`Review · ${gateName} gate ${gate}`} />

		<ul className={LIST}>
			{polls.map(({ id, ...poll }) => (
				<li key={id}>
					<Verdict {...poll} />
				</li>
			))}
		</ul>

		<div className={FOOTER}>
			{back ? <Action label={back.label} size="lg" onUse={back.onUse} /> : null}
			{note ? (
				<Text size="body" tone="muted">
					{note}
				</Text>
			) : null}
		</div>
	</Screen>
);
