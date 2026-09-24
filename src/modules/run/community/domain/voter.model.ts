/**
 * A player as the community board draws them: a name, a face, and whether the
 * face is the viewer's own.
 *
 * Its own model because more than one surface on the board needs it — the poll
 * splits name everyone who picked an option, and the climb names everyone on
 * the track — and none of them should have to agree on the shape by accident.
 */
export type CommunityVoter = {
	id: string;
	displayName: string;
	/** Optional so fixtures stay lean — the handler always sets it. */
	photoUrl?: string | null;
	/** The equipped border's art, worn wherever the game draws the player. */
	borderUrl?: string | null;
	/** The viewer's own chip — rendered as "you". */
	you: boolean;
};
