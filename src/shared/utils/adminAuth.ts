export const ADMIN_EMAILS = [
	"marciano@kabisa.nl",
	"marciano_schildmeijer@live.nl",
] as const;

export const isAdminEmail = (email: string | null | undefined): boolean =>
	ADMIN_EMAILS.some((adminEmail) => adminEmail === email);
