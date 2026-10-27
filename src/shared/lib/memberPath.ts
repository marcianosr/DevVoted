import { POLLS_PATH } from "~/shared/lib/pollPath";

const MEMBER_ONLY_PATHS = ["/profile", "/dex", POLLS_PATH] as const;

const isUnder = (pathname: string, root: string): boolean =>
	pathname === root || pathname.startsWith(`${root}/`);

export const isMemberOnlyPath = (pathname: string): boolean =>
	MEMBER_ONLY_PATHS.some((root) => isUnder(pathname, root));
