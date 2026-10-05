import { Fragment, useEffect, useState } from "react";

import type {
	ApprovalNoticeView,
	ApprovedQuestion,
} from "~/modules/polls/authoring/application/approvalNotice.viewmodel";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Balance } from "~/ui/kanto-theme/Balance.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Icon } from "~/ui/kanto-theme/Icon.ui";
import { Modal } from "~/ui/kanto-theme/Modal.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { ScreenFooter } from "~/ui/kanto-theme/ScreenFooter.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const COPY = {
	label: "Poll published!",
	intro:
		"Thank you for your contribution! Your poll will be available for players to answer!",
	archivedStorage: "Archived storage",
	close: "Close",
} as const;

const MODAL_THEME: KantoColor = "viridian";
const GAIN: KantoColor = "viridian";
const BALANCE_BEAT_MS = 600;

const TILE =
	"flex size-7 shrink-0 items-center justify-center rounded-md bg-theme-raised text-theme";
const CODE = "rounded-xs bg-theme-raised px-1 text-theme";
const BALANCE_ROW = "flex items-center justify-between gap-3";

export type PollApprovedModalProps = ApprovalNoticeView & {
	isMutating?: boolean;
	onDismiss: () => void;
};

const QuestionRow = ({ segments }: Pick<ApprovedQuestion, "segments">) => (
	<Panel.Row>
		<span aria-hidden className={TILE}>
			<Icon name="tick" />
		</span>
		<Typography variant="paragraph" as="span">
			{segments.map((segment, index) =>
				segment.kind === "code" ? (
					<code key={`${index}-${segment.text}`} className={CODE}>
						{segment.text}
					</code>
				) : (
					<Fragment key={`${index}-${segment.text}`}>{segment.text}</Fragment>
				)
			)}
		</Typography>
	</Panel.Row>
);

const useBalanceBeat = () => {
	const [landed, setLanded] = useState(false);

	useEffect(() => {
		const beat = setTimeout(() => setLanded(true), BALANCE_BEAT_MS);
		return () => clearTimeout(beat);
	}, []);

	return landed;
};

export const PollApprovedModal = ({
	heading,
	reward,
	fromKb,
	toKb,
	questions,
	isMutating = false,
	onDismiss,
}: PollApprovedModalProps) => {
	const landed = useBalanceBeat();

	return (
		<Modal
			label={COPY.label}
			heading={heading}
			theme={MODAL_THEME}
			onDismiss={onDismiss}
		>
			<Typography variant="caption" as="p">
				{COPY.intro}
			</Typography>

			<Panel>
				<Panel.Rows>
					{questions.map((question) => (
						<QuestionRow key={question.id} segments={question.segments} />
					))}
				</Panel.Rows>
				<Panel.Footer>
					<span className={BALANCE_ROW}>
						<Balance
							label={COPY.archivedStorage}
							kb={landed ? toKb : fromKb}
							layout="inline"
						/>
						<Badge color={GAIN}>{reward}</Badge>
					</span>
				</Panel.Footer>
			</Panel>

			<ScreenFooter
				action={{
					label: COPY.close,
					mark: "dashed",
					onPress: isMutating ? undefined : onDismiss,
				}}
				rule={false}
			/>
		</Modal>
	);
};
