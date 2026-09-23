export const ADMIN_EMAILS = [
	"marciano@kabisa.nl",
	"marciano_schildmeijer@live.nl",
] as const;

// `.includes` narrows its argument to the tuple's literal union, so a plain
// string needs a cast to pass. Comparing each entry instead keeps it cast-free.
export const isAdminEmail = (email: string | null | undefined): boolean =>
	ADMIN_EMAILS.some((adminEmail) => adminEmail === email);
