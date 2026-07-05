import { PrimaryButton } from "~/ui/PrimaryButton.component";
import { SecondaryButton } from "~/ui/SecondaryButton.component";

type DailyResultShareProps = {
	/** The exact spoiler-free text that gets copied — rendered as a live preview. */
	preview: string;
	/** True briefly after a successful copy, to show the confirmation. */
	copied: boolean;
	onCopy: () => void;
	onShare: () => void;
};

/**
 * Presentational card for the shareable daily result. It shows the player the
 * exact text they'll paste (so there are no surprises) and the two share actions.
 * All copy/clipboard/navigation logic lives in the wiring component — this file
 * is pure props so it renders from mock data in Storybook without a server.
 */
export const DailyResultShare = ({
	preview,
	copied,
	onCopy,
	onShare,
}: DailyResultShareProps) => (
	<section className="flex flex-col gap-3 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
		<header className="flex flex-col gap-1">
			<h2 className="text-lg font-semibold text-white">Share your build</h2>
			<p className="text-sm text-gray-400">
				Spoiler-free — no answers, just how far you got. Drop it in a channel.
			</p>
		</header>

		<pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-200 p-4 rounded-lg bg-black/60 border border-zinc-800">
			{preview}
		</pre>

		<div className="flex flex-wrap items-center gap-3">
			<PrimaryButton onClick={onCopy}>
				{copied ? "Copied ✓" : "Copy result"}
			</PrimaryButton>
			<SecondaryButton onClick={onShare}>Share to X / LinkedIn</SecondaryButton>
			<span aria-live="polite" className="text-sm text-green-400">
				{copied ? "Copied to clipboard" : ""}
			</span>
		</div>
	</section>
);
