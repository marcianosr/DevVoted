const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://localhost:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

type AdminUserError = {
	error_code?: string;
	msg?: string;
	message?: string;
};

const isAlreadyExists = (body: AdminUserError): boolean =>
	body.error_code === "email_exists" ||
	body.error_code === "user_already_exists" ||
	(body.msg ?? body.message ?? "").toLowerCase().includes("already");

export const requireServiceRoleKey = (): void => {
	if (SERVICE_ROLE_KEY) return;
	throw new Error(
		"SUPABASE_SERVICE_ROLE_KEY is not set. The seed cannot create login " +
			"accounts without it.\nGet it from `npx supabase status` and add it to .env."
	);
};

export const createLocalAuthUser = async (args: {
	id: string;
	email: string;
	password: string;
}): Promise<void> => {
	const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			apikey: SERVICE_ROLE_KEY,
			Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
		},
		body: JSON.stringify({ ...args, email_confirm: true }),
	});

	if (response.ok) return;

	const body: AdminUserError = await response.json();
	if (isAlreadyExists(body)) return;

	throw new Error(
		`Could not create auth user ${args.email}: ${body.msg ?? body.message ?? response.statusText}`
	);
};

export const deleteLocalAuthUser = async (id: string): Promise<void> => {
	await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
		method: "DELETE",
		headers: {
			apikey: SERVICE_ROLE_KEY,
			Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
		},
	});
};
