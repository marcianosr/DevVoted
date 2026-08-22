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

export type QuestionProps = {
	children: ReactNode;
	category?: QuestionCategory;
	meta?: readonly string[];
};

export const Question = ({ children, category, meta }: QuestionProps) => (
	<div className={QUESTION}>
		{(category ?? meta?.length) ? (
			// Above the verse, not below it: these are the terms you read the
			// question under, and by the time you have read it they are too late.
			<p className={META}>
				{category ? (
					<Chip tone={category.tone ?? "theme"}>{category.label}</Chip>
				) : null}
				{meta?.map((item, index) => (
					<Fragment key={item}>
						{index > 0 ? (
							<span aria-hidden className={SEPARATOR}>
								·
							</span>
						) : null}
						<Text size="meta" tone="muted">
							{item}
						</Text>
					</Fragment>
				))}
			</p>
		) : null}
		<Text as="h1" size="ask">
			{children}
		</Text>
	</div>
);
