import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const ROW = "flex w-full min-w-0 items-center gap-3";
const SUBJECT = "min-w-0 flex-1";

const COPY = {
	approved: "approved",
} as const;

const APPROVED_COLOR: KantoColor = "saffron";

export type ApprovalRow = {
	pollId: string;
	slot: number;
	category: string;
	color?: KantoColor;
	refusal?: string;
};

export type ApprovalListProps = {
	label: string;
	hint: string;
	rows: readonly ApprovalRow[];
	committed: string | null;
	onApprove?: (pollId: string) => void;
	refusal?: string;
};

const Slot = ({
	row,
	committed,
	onApprove,
}: {
	row: ApprovalRow;
	committed: string | null;
	onApprove?: (pollId: string) => void;
}) => {
	const armed = committed === row.pollId;
	if (onApprove === undefined || row.refusal !== undefined)
		return <Badge color={armed ? APPROVED_COLOR : undefined}>{row.slot}</Badge>;

	return (
		<Badge armed={armed} onPress={() => onApprove(row.pollId)}>
			{row.slot}
		</Badge>
	);
};

const Standing = ({
	row,
	committed,
}: {
	row: ApprovalRow;
	committed: string | null;
}) => {
	if (row.refusal !== undefined) return <Badge>{row.refusal}</Badge>;
	if (committed === row.pollId)
		return <Badge color={APPROVED_COLOR}>{COPY.approved}</Badge>;
	return null;
};

export const ApprovalList = ({
	label,
	hint,
	rows,
	committed,
	onApprove,
	refusal,
}: ApprovalListProps) => (
	<Panel>
		<Panel.Header label={label} />

		<Panel.Body>
			<Typography variant="hint">{hint}</Typography>
		</Panel.Body>

		<Panel.Rows>
			{rows.map((row) => (
				<Panel.Row
					key={row.pollId}
					trailing={<Standing row={row} committed={committed} />}
				>
					<span className={ROW}>
						<Slot row={row} committed={committed} onApprove={onApprove} />
						<span className={SUBJECT}>
							<Typography variant="caption">{row.category}</Typography>
						</span>
					</span>
				</Panel.Row>
			))}
		</Panel.Rows>

		{refusal === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{refusal}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
