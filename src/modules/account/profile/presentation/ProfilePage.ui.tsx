import type { ReactNode } from "react";

import {
	Avatar,
	type AvatarUser,
} from "~/modules/account/profile/presentation/Avatar.ui";

const COPY = {
	ownTitle: "Your Profile",
	otherTitle: (userId: string) => `Profile: ${userId}`,
} as const;

export type ProfilePageProps = {
	user: AvatarUser;
	isOwnProfile: boolean;
	wornTitle?: string;
	children?: ReactNode;
};

export const ProfilePage = ({
	user,
	isOwnProfile,
	wornTitle,
	children,
}: ProfilePageProps) => (
	<section className="min-h-screen">
		<div className="max-w-7xl mx-auto p-4 space-y-8">
			<header className="flex items-center gap-4">
				<Avatar user={user} size="2xl" shape="square" />
				<div>
					<h1 className="text-3xl text-theme">
						{isOwnProfile ? COPY.ownTitle : COPY.otherTitle(user.id)}
					</h1>
					{wornTitle === undefined ? null : (
						<p className="text-lg text-pewter">{wornTitle}</p>
					)}
				</div>
			</header>

			{children}
		</div>
	</section>
);
