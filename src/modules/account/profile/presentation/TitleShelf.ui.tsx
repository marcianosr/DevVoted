import { Button } from "~/ui/kanto-theme/Button.ui";

const COPY = {
	heading: "Titles",
	blurb: "Earned through play, never bought. Wear one.",
	equip: "Wear",
	unequip: "Take off",
	locked: "Locked",
	none: "No titles earned yet.",
} as const;

export type TitleRowProps = {
	name: string;
	earnedWhen: string;
	earned: boolean;
	equipped: boolean;
	isMutating: boolean;
	onPress: () => void;
};

export type TitleShelfProps = {
	rows: readonly (TitleRowProps & { id: string })[];
	error?: string;
};

const TitleRow = ({
	name,
	earnedWhen,
	earned,
	equipped,
	isMutating,
	onPress,
}: TitleRowProps) => (
	<li
		className={`border p-3 flex items-center gap-4 ${
			earned ? "border-gray-800" : "border-gray-800/40 opacity-60"
		}`}
	>
		<span className="min-w-0 flex-1">
			<span className={`block ${earned ? "text-theme" : "text-pewter"}`}>
				{name}
			</span>
			<span className="block text-sm text-pewter">{earnedWhen}</span>
		</span>
		{earned ? (
			<Button
				size="sm"
				tone="action"
				label={equipped ? COPY.unequip : COPY.equip}
				onPress={onPress}
				disabled={isMutating}
			/>
		) : (
			<span className="text-sm text-pewter">{COPY.locked}</span>
		)}
	</li>
);

export const TitleShelf = ({ rows, error }: TitleShelfProps) => (
	<section id="titles" className="space-y-3 scroll-mt-8">
		<header className="space-y-2">
			<h2 className="text-4xl">{COPY.heading}</h2>
			<p className="text-lg">{COPY.blurb}</p>
		</header>

		{rows.some((row) => row.earned) ? null : (
			<p className="text-sm text-pewter">{COPY.none}</p>
		)}

		<ul className="space-y-2">
			{rows.map(({ id, ...row }) => (
				<TitleRow key={id} {...row} />
			))}
		</ul>

		{error && <p className="text-cinnabar text-sm">{error}</p>}
	</section>
);
