/**
 * Represents a user who has created at least one poll
 * Used for filtering polls by creator in admin view
 */
export type PollCreator = {
	id: string;
	displayName: string;
};
