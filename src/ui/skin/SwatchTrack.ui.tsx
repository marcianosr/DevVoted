import { CURSOR_BLOCKED, CURSOR_PICKABLE } from "./cursors";
import { Popover } from "./Popover.ui";
import { Subtitle } from "./Subtitle.ui";
import { Swatch, type SwatchState } from "./Swatch.ui";
import { Title } from "./Title.ui";

const TRACK = "flex items-center gap-1";
const TRIGGER = "inline-flex rounded";
const CARD = "flex flex-col gap-1";
const NAME = "flex items-center gap-2";

export type SwatchTrackItem = {
	id: string;
	state: SwatchState;
	theme?: string;
	gate: string;
	name: string;
	earn: string;
	requirement?: string;
};

export type SwatchTrackProps = {
	items: readonly SwatchTrackItem[];
	onSelect?: (id: string) => void;
};

export const SwatchTrack = ({ items, onSelect }: SwatchTrackProps) => (
	<span className={TRACK}>
		{items.map(({ id, state, theme, gate, name, earn, requirement }) => (
			<Popover
				key={id}
				content={
					<span className={CARD}>
						<Subtitle>{gate}</Subtitle>
						<span className={NAME}>
							<Swatch size="pip" state="earned" theme={theme} />
							<Title as="h3">{name}</Title>
						</span>
						<Subtitle>{earn}</Subtitle>
						{requirement ? <Subtitle>{requirement}</Subtitle> : null}
					</span>
				}
			>
				<button
					type="button"
					aria-label={`${gate}: ${name}. ${earn}`}
					disabled={state === "locked"}
					onClick={() => onSelect?.(id)}
					className={`${TRIGGER} ${state === "locked" ? CURSOR_BLOCKED : CURSOR_PICKABLE}`}
				>
					<Swatch size="pip" state={state} theme={theme} />
				</button>
			</Popover>
		))}
	</span>
);
