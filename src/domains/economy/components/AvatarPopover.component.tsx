import { AvatarWithBorder } from "~/domains/economy/components/AvatarWithBorder.component";
import type {
	GateTypeId,
	PipelineSlot,
} from "~/domains/runs/models/pipeline.model";
import { DIFFICULTY_CLASSES } from "~/domains/runs/utils/difficultyStyles";
import { formatRequirement } from "~/domains/runs/utils/formatPipelineRequirement";
import { CATEGORY_METADATA } from "~/domains/shared/categories";
import {
	UserTitle,
	type UserRole,
} from "~/domains/users/components/UserTitle.component";
import { Popover } from "~/ui/Popover.component";

type AvatarPopoverProps = {
	displayName: string;
	photoUrl: string | null | undefined;
	borderId: string | null;
	role?: UserRole | string | null;
	pipelineSlots?: PipelineSlot[] | null;
	children: React.ReactNode;
};

const SLOT_NAME: Record<GateTypeId, string> = {
	"coverage-gain": "Coverage gain",
	"correct-answers": "Correct answers",
	"short-window": "Short window",
	"cold-start": "Cold start",
	"category-mastery": "Category mastery",
};

// category-mastery slots are bound to a specific category — surface it inline
// so players can tell apart e.g. CSS mastery vs JS mastery at a glance.
const getSlotName = (slot: PipelineSlot): string => {
	if (slot.requirement.type === "category-mastery") {
		return `${CATEGORY_METADATA[slot.requirement.category].name} mastery`;
	}
	return SLOT_NAME[slot.gateTypeId];
};

const PipelineStrip = ({ slots }: { slots: PipelineSlot[] }) => {
	if (slots.length === 0) return null;
	return (
		<div className="w-full pt-2 border-t border-gray-800 space-y-1">
			<p className="text-[10px] uppercase tracking-wide text-gray-500">
				Pipeline
			</p>
			<ul className="space-y-0.5">
				{slots.map((slot, i) => (
					<li
						key={i}
						className="flex items-center justify-between gap-2 text-xs"
						title={formatRequirement(slot.requirement)}
					>
						<span className="text-gray-300 truncate">{getSlotName(slot)}</span>
						<span
							className={`${DIFFICULTY_CLASSES[slot.difficulty]} text-[10px] uppercase tracking-wide`}
						>
							{slot.difficulty}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
};

export const AvatarPopover = ({
	displayName,
	photoUrl,
	borderId,
	role,
	pipelineSlots,
	children,
}: AvatarPopoverProps) => (
	<Popover
		ariaLabel={`Show ${displayName}'s avatar`}
		content={
			<div className="flex flex-col items-center gap-2 w-40">
				<AvatarWithBorder
					photoUrl={photoUrl}
					displayName={displayName}
					borderId={borderId}
					size="lg"
				/>
				<span className="text-sm text-white text-center w-full truncate">
					{displayName}
				</span>
				<UserTitle role={role} />
				{pipelineSlots && pipelineSlots.length > 0 && (
					<PipelineStrip slots={pipelineSlots} />
				)}
			</div>
		}
	>
		{children}
	</Popover>
);
