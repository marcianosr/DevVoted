import { useRef, type FormEvent } from "react";

import { Button } from "~/ui/kanto-theme/Button.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

const COPY = {
	email: "Username",
	password: "Password",
	pending: "…",
	github: "Continue with GitHub",
	githubPending: "Redirecting…",
} as const;

const isDevelopment = process.env.NODE_ENV === "development";

const PAGE = "flex items-start justify-center p-8";
const FORM = "flex flex-col gap-4";
const FIELD = "flex flex-col gap-1";
const INPUT = "rounded border border-edge bg-surface-raised px-2 py-1";
const PRESSES = "flex flex-col items-start gap-3 pt-2";

export type AuthCredentials = { email: string; password: string };

const credentialsFrom = (form: HTMLFormElement): AuthCredentials => {
	const entries = new FormData(form);
	const email = entries.get("email");
	const password = entries.get("password");

	return {
		email: typeof email === "string" ? email : "",
		password: typeof password === "string" ? password : "",
	};
};

export type AuthProps = {
	actionText: string;
	subTitle?: string;
	status: "pending" | "idle" | "success" | "error";
	onSubmit: (credentials: AuthCredentials) => void;
	message?: string;
	/** Offered when the credentials look like an account that does not exist yet. */
	retry?: { label: string; onRetry: (credentials: AuthCredentials) => void };
	github?: { pending: boolean; onPress: () => void };
};

export const Auth = ({
	actionText,
	subTitle,
	status,
	onSubmit,
	message,
	retry,
	github,
}: AuthProps) => {
	const form = useRef<HTMLFormElement>(null);

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSubmit(credentialsFrom(event.currentTarget));
	};

	const askAgain = () => {
		if (form.current === null) return;
		retry?.onRetry(credentialsFrom(form.current));
	};

	return (
		<div className={PAGE}>
			<Panel>
				<Panel.Header label={actionText} meta={subTitle} />
				<Panel.Body>
					<form ref={form} onSubmit={submit} className={FORM}>
						{isDevelopment && (
							<>
								<div className={FIELD}>
									<label htmlFor="email">
										<Typography variant="label">{COPY.email}</Typography>
									</label>
									<input
										type="email"
										name="email"
										id="email"
										className={INPUT}
									/>
								</div>
								<div className={FIELD}>
									<label htmlFor="password">
										<Typography variant="label">{COPY.password}</Typography>
									</label>
									<input
										type="password"
										name="password"
										id="password"
										className={INPUT}
									/>
								</div>
							</>
						)}

						{message !== undefined && (
							<div data-screen-theme="cinnabar">
								<Typography variant="caption">{message}</Typography>
							</div>
						)}

						<div className={PRESSES}>
							{isDevelopment && (
								<Button
									size="md"
									tone="action"
									label={status === "pending" ? COPY.pending : actionText}
									disabled={status === "pending"}
									onPress={() => form.current?.requestSubmit()}
								/>
							)}

							{retry !== undefined && (
								<Button size="sm" label={retry.label} onPress={askAgain} />
							)}

							{github !== undefined && (
								<Button
									size="md"
									label={github.pending ? COPY.githubPending : COPY.github}
									disabled={github.pending}
									onPress={github.onPress}
								/>
							)}
						</div>
					</form>
				</Panel.Body>
			</Panel>
		</div>
	);
};
