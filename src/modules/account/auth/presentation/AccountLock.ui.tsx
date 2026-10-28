import type { ReactNode } from "react";

import { Button } from "~/ui/kanto-theme/Button.ui";
import { Icon } from "~/ui/kanto-theme/Icon.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	lead: "Sign up to see what other players did!",
	press: "Create an account",
	benefits: [
		"View the community",
		"Save your progress",
		"Collect cosmetics: swatches, titles and borders",
		"Review your answers",
		"Join the competition",
	],
} as const;

const FRAME = "relative";
const BEHIND = "select-none blur-sm";
const SCRIM = "absolute inset-0 z-10 bg-black/60 px-4 pt-16 sm:pt-24";
const CARD = "sticky top-24 mx-auto w-full max-w-md";
const BODY = "flex flex-col gap-5";
const BENEFITS = "flex flex-col gap-2";
const BENEFIT = "flex items-center gap-2";
const TICK = "text-theme";

export type AccountLockProps = {
	onSignIn: () => void;
	children: ReactNode;
};

export const AccountLock = ({ onSignIn, children }: AccountLockProps) => (
	<div className={FRAME}>
		<div className={BEHIND} inert aria-hidden>
			{children}
		</div>
		<div className={SCRIM}>
			<div className={CARD}>
				<Panel>
					<Panel.Body className={BODY}>
						<Typography variant="headline" as="h2">
							{COPY.lead}
						</Typography>
						<ul className={BENEFITS}>
							{COPY.benefits.map((benefit) => (
								<li key={benefit} className={BENEFIT}>
									<span className={TICK} aria-hidden>
										<Icon name="tick" />
									</span>
									<Typography variant="paragraph" as="span">
										{benefit}
									</Typography>
								</li>
							))}
						</ul>
						<Button
							tone="primary"
							size="xl"
							width="fill"
							label={COPY.press}
							onPress={onSignIn}
						/>
					</Panel.Body>
				</Panel>
			</div>
		</div>
	</div>
);
