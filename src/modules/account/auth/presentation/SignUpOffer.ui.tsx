import { Button } from "~/ui/kanto-theme/Button.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	lead: "Keep this run",
	body: "You are playing as a guest. Create an account and this run, its swatches and its titles stay yours.",
	press: "Create an account",
} as const;

const BODY =
	"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";
const TEXT = "flex flex-col gap-1";

export type SignUpOfferProps = {
	onSignUp: () => void;
};

export const SignUpOffer = ({ onSignUp }: SignUpOfferProps) => (
	<Panel>
		<Panel.Body className={BODY}>
			<div className={TEXT}>
				<Typography variant="headline" as="h2">
					{COPY.lead}
				</Typography>
				<Typography variant="paragraph">{COPY.body}</Typography>
			</div>
			<Button tone="primary" label={COPY.press} onPress={onSignUp} />
		</Panel.Body>
	</Panel>
);
