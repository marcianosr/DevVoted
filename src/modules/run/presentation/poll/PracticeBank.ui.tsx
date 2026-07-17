import {
	type CategoryCode,
	getCategoryMetadata,
} from "~/domains/shared/categories";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";

export type PracticeBankEntry = {
	id: string;
	category: CategoryCode;
	question: string;
	timesSeen: number;
	/** Display date of the last encounter; absent means never seen ("new"). */
	lastSeen?: string;
};

type PracticeBankProps = {
	entries: readonly PracticeBankEntry[];
	/** Total polls in the bank; a run draws a subset. Defaults to the shown count. */
	totalCount?: number;
};

const seenLabel = ({ timesSeen, lastSeen }: PracticeBankEntry) =>
	lastSeen === undefined ? "new" : `seen ${timesSeen}× · last ${lastSeen}`;

/** The pool of past daily polls a run draws from — the practice bank. */
export const PracticeBank = ({ entries, totalCount }: PracticeBankProps) => (
	<section className="flex flex-col gap-4">
		<header>
			<Title as="h2" size="sm">
				Practice bank
			</Title>
			<Subtitle>{totalCount ?? entries.length} polls to draw from</Subtitle>
		</header>
		<ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-700">
			{entries.map((entry) => (
				<li key={entry.id} className="flex items-center gap-3 px-4 py-3">
					<span
						{...categoryTheme(entry.category)}
						className="flex shrink-0 items-center gap-1.5 font-bold text-theme"
					>
						<span className="inline-block h-3.5 w-3.5 rounded bg-theme" />
						{getCategoryMetadata(entry.category).name}
					</span>
					<Paragraph className="min-w-0 truncate">{entry.question}</Paragraph>
					<span className="ml-auto shrink-0 text-xs text-zinc-500">
						{seenLabel(entry)}
					</span>
				</li>
			))}
		</ul>
	</section>
);
