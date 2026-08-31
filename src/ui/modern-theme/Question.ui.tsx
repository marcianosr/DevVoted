import { Fragment, type ReactNode } from "react";

import { Chip, type ChipTone } from "./Chip.ui";
import { Text } from "./Text.ui";

const QUESTION = "flex flex-col gap-3";
const META = "flex flex-wrap items-center gap-2";
const SEPARATOR = "text-xs text-zinc-700";

export type QuestionCategory = {
	label: string;
	tone?: ChipTone;
};

/** A figure the poll turns on gets a chip; the words around it stay muted, so the
 * line reads as facts with the numbers picked out rather than as a row of badges. */
export type QuestionFact = {
	label?: string;
	figure?: string;
	tone?: ChipTone;
};

export type QuestionProps = {
	children: ReactNode;
	category?: QuestionCategory;
	meta?: readonly QuestionFact[];
};

const factKey = (fact: QuestionFact) =>
	`${fact.label ?? ""}${fact.figure ?? ""}`;

export const Question = ({ children, category, meta }: QuestionProps) => (
	<div className={QUESTION}>
		{(category ?? meta?.length) ? (
			<p className={META}>
				{category ? (
					<Chip tone={category.tone ?? "theme"}>{category.label}</Chip>
				) : null}
				{meta?.map((fact, index) => (
					<Fragment key={factKey(fact)}>
						{index > 0 ? (
							<span aria-hidden className={SEPARATOR}>
								·
							</span>
						) : null}
						{fact.label ? (
							<Text size="meta" tone="muted">
								{fact.label}
							</Text>
						) : null}
						{fact.figure ? (
							<Chip tone={fact.tone ?? "muted"}>{fact.figure}</Chip>
						) : null}
					</Fragment>
				))}
			</p>
		) : null}
		<Text as="h1" size="ask">
			{children}
		</Text>
	</div>
);
