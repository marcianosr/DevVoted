export type AuthorRole = "user" | "poll-editor" | "admin";

const ROLE_LABELS = {
	user: undefined,
	"poll-editor": "Poll editor",
	admin: "Admin",
} satisfies Record<AuthorRole, string | undefined>;

export const roleLabelFor = (role: AuthorRole | null): string | undefined =>
	role === null ? undefined : ROLE_LABELS[role];

export type Authorship = {
	readonly role?: string;
	readonly published: number;
};

export const NO_AUTHORSHIP: Authorship = { published: 0 };

export const authorshipOf = (
	role: AuthorRole,
	counts: Omit<Authorship, "role">
): Authorship => {
	const label = roleLabelFor(role);
	return label === undefined ? counts : { role: label, ...counts };
};

export const isContributor = ({ published }: Authorship): boolean =>
	published > 0;
