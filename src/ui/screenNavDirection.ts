export type ScreenNavDirection = "forward" | "back";

// The direction of the last Screen action that fired. A Screen records this when
// its left ("back") or right ("forward") action is clicked; the next Screen to
// mount consumes it to animate in from the matching side. Module-level because
// the arriving Screen is a different instance (often a different route) than the
// one whose action fired, so the signal can't be passed as a prop.
let pendingDirection: ScreenNavDirection | null = null;

export const setScreenNavDirection = (direction: ScreenNavDirection) => {
	pendingDirection = direction;
};

export const peekScreenNavDirection = (): ScreenNavDirection | null =>
	pendingDirection;

export const clearScreenNavDirection = () => {
	pendingDirection = null;
};
