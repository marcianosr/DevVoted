import type { ReactNode } from "react";

import { cva } from "class-variance-authority";

import { Row, type RowSpacing } from "./Row.ui";
import { Subtitle } from "./Subtitle.ui";
import type { SkinTone } from "./tones";

export type Definition = {
	term: string;
	detail: ReactNode;
	tone?: SkinTone;
};

// `panel` is the standalone record, `nested` the same pairs folded under a row —
// dividers, density and term width all follow that one choice together.
export type DefinitionsVariant = "panel" | "nested";

const DIVIDERS = {
	panel: "divide-y divide-edge",
	nested: "",
} satisfies Record<DefinitionsVariant, string>;

const SPACING = {
	panel: "compact",
	nested: "tight",
} satisfies Record<DefinitionsVariant, RowSpacing>;

const TERM = "shrink-0";

const TERM_WIDTH = {
	panel: "w-28",
	nested: "w-20",
} satisfies Record<DefinitionsVariant, string>;

const listVariants = cva("", { variants: { variant: DIVIDERS } });
const termVariants = cva(TERM, { variants: { variant: TERM_WIDTH } });

export type DefinitionsProps = {
	items: readonly Definition[];
	variant?: DefinitionsVariant;
};

export const Definitions = ({ items, variant = "panel" }: DefinitionsProps) => (
	<dl className={listVariants({ variant })}>
		{items.map((item) => (
			<Row
				key={item.term}
				spacing={SPACING[variant]}
				align="baseline"
				contentAs="dd"
				leading={
					<dt className={termVariants({ variant })}>
						<Subtitle>{item.term}</Subtitle>
					</dt>
				}
			>
				<Subtitle tone={item.tone ?? "default"}>{item.detail}</Subtitle>
			</Row>
		))}
	</dl>
);
