export type UserRole = "user" | "poll-editor" | "admin";

const ROLE_LABELS: Partial<Record<UserRole, string>> = {
	"poll-editor": "Poll Editor",
	admin: "Admin",
};

type UserTitleProps = {
	role: UserRole | string | null | undefined;
};

export const UserTitle = ({ role }: UserTitleProps) => {
	const label = role ? ROLE_LABELS[role as UserRole] : undefined;
	if (!label) return null;

	return (
		<p className="text-xs uppercase tracking-wide text-zinc-400 text-center">
			{label}
		</p>
	);
};
