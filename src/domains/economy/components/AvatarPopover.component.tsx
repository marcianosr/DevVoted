import { AvatarWithBorder } from "~/domains/economy/components/AvatarWithBorder.component";
import {
	UserTitle,
	type UserRole,
} from "~/domains/users/components/UserTitle.component";
import { Popover } from "~/ui/Popover.component";

type AvatarPopoverProps = {
	displayName: string;
	photoUrl: string | null | undefined;
	borderId: string | null;
	role?: UserRole | string | null;
	children: React.ReactNode;
};

export const AvatarPopover = ({
	displayName,
	photoUrl,
	borderId,
	role,
	children,
}: AvatarPopoverProps) => (
	<Popover
		ariaLabel={`Show ${displayName}'s avatar`}
		content={
			<div className="flex flex-col items-center gap-2 w-40">
				<AvatarWithBorder
					photoUrl={photoUrl}
					displayName={displayName}
					borderId={borderId}
					size="lg"
				/>
				<span className="text-sm text-white text-center w-full truncate">
					{displayName}
				</span>
				<UserTitle role={role} />
			</div>
		}
	>
		{children}
	</Popover>
);
