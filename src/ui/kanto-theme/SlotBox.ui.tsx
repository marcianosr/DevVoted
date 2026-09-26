import { Weight } from "./Weight.ui";

const BOX =
	"flex w-full items-center gap-2 rounded-lg border border-dashed border-theme-faint px-4 py-2 text-sm";

const EMPTY_WORDS = "text-theme-muted";
const ROOM = "ml-auto";
const READER_ONLY = "sr-only";

const EMPTY_LABEL = "empty";
const ROOM_WORDS = "weight free";

export type SlotBoxProps = {
	label?: string;
	/**
	 * The room left, as one row rather than one box per unit. A box per unit
	 * counts what the block already measures, and four of them push the build
	 * off the screen.
	 */
	slots?: number;
};

export const SlotBox = ({ label = EMPTY_LABEL, slots }: SlotBoxProps) => (
	<div className={BOX}>
		<span className={EMPTY_WORDS}>{label}</span>

		{slots === undefined ? null : (
			<span className={ROOM}>
				<span className={READER_ONLY}>{`${slots} ${ROOM_WORDS}`}</span>
				<span aria-hidden>
					<Weight slots={slots} />
				</span>
			</span>
		)}
	</div>
);
