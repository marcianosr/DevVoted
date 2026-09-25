import { Button } from "~/ui/kanto-theme/Button.ui";
import { Modal } from "~/ui/kanto-theme/Modal.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const COPY = {
	label: "Titles granted",
	eyebrow: "you were here before",
	heading: "The rebuild kept your record",
	closing: "New runs begin under the current rules.",
	wear: "Wear",
	worn: "Worn",
	close: "Close",
} as const;

const LIST = "flex flex-col gap-3";
const ROW = "flex items-center gap-4 border border-theme-faint p-3";
const ROW_TEXT = "flex min-w-0 flex-1 flex-col gap-1";
const DIVIDER = "border-t border-theme-faint";
const ACTIONS = "flex items-center justify-end pt-1";
const STACK = "flex flex-col gap-4";

export type GrantedTitle = {
	id: string;
	name: string;
	earnedWhen: string;
	worn: boolean;
};

export type TitleGrantModalProps = {
	titles: readonly GrantedTitle[];
	archivedOn?: string;
	isMutating?: boolean;
	onWear: (titleId: string) => void;
	onDismiss: () => void;
};

export const TitleGrantModal = ({
	titles,
	archivedOn,
	isMutating = false,
	onWear,
	onDismiss,
}: TitleGrantModalProps) => (
	<Modal label={COPY.label} onDismiss={onDismiss}>
		<div className={STACK}>
			<Typography variant="hint">{COPY.eyebrow}</Typography>
			<Typography variant="title">{COPY.heading}</Typography>
			{archivedOn === undefined ? null : (
				<Typography variant="caption" as="p">
					{`Your run from ${archivedOn} has entered the archive.`}
				</Typography>
			)}

			<div className={DIVIDER} />

			<ul className={LIST}>
				{titles.map((title) => (
					<li key={title.id} className={ROW}>
						<span className={ROW_TEXT}>
							<Typography variant="accent">{title.name}</Typography>
							<Typography variant="hint">{title.earnedWhen}</Typography>
						</span>
						<Button
							size="sm"
							tone={title.worn ? "ambient" : "action"}
							label={title.worn ? COPY.worn : COPY.wear}
							disabled={title.worn || isMutating}
							onPress={() => onWear(title.id)}
						/>
					</li>
				))}
			</ul>

			<Typography variant="hint">{COPY.closing}</Typography>

			<div className={ACTIONS}>
				<Button
					size="md"
					tone="commit"
					label={COPY.close}
					disabled={isMutating}
					onPress={onDismiss}
				/>
			</div>
		</div>
	</Modal>
);
