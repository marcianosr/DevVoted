type PollCodeSandboxProps = {
	url: string;
};

/**
 * Embeds a poll's CodeSandbox example (the `code_sandbox_example` column) as a
 * live, interactive frame — the counterpart to CodeBlockMarkdown for questions
 * whose code is a running sandbox rather than a static snippet. The sandbox/allow
 * attributes scope what the untrusted third-party frame may do.
 */
export const PollCodeSandbox = ({ url }: PollCodeSandboxProps) => (
	<iframe
		src={url}
		title="CodeSandbox example"
		className="my-2 h-96 w-full rounded-lg border border-zinc-700"
		allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
		sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
	/>
);
