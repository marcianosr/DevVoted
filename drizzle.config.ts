import { DATABASE_URL } from "./src/database/db";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/database/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: DATABASE_URL,
	},
});
