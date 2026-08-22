const AVATAR =
	"inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-theme text-xs font-bold text-black";

export type AvatarProps = {
	/** Shown as the initial; the full name belongs beside the avatar, not in it. */
	name: string;
};

export const Avatar = ({ name }: AvatarProps) => (
	<span aria-hidden className={AVATAR}>
		{name.charAt(0).toUpperCase()}
	</span>
);
