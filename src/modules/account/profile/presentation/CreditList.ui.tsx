import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

/** Enough of a person to credit them; narrower than PublicUser on purpose, so
 * any list of contributors can feed this without carrying account fields. */
export type CreditedPerson = {
	readonly id: string;
	readonly displayName: string;
	readonly photoUrl: string | null;
	readonly githubUsername: string | null;
};

type CreditListProps = {
	title: string;
	people: readonly CreditedPerson[];
};

const Person = ({ person }: { person: CreditedPerson }) => (
	<li className="flex items-center gap-3">
		{person.photoUrl && (
			<img
				src={person.photoUrl}
				alt={person.displayName}
				className="w-12 h-12 rounded-full"
			/>
		)}
		<div>
			<Paragraph>{person.displayName}</Paragraph>
			{person.githubUsername && (
				<a
					href={`https://github.com/${person.githubUsername}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-sm text-cerulean hover:underline"
				>
					@{person.githubUsername}
				</a>
			)}
		</div>
	</li>
);

/** The credits blocks on the stats page: poll editors, and special thanks. */
export const CreditList = ({ title, people }: CreditListProps) => (
	<div>
		<Title>{title}</Title>
		<ul className="flex flex-wrap gap-6 mt-4">
			{people.map((person) => (
				<Person key={person.id} person={person} />
			))}
		</ul>
	</div>
);
