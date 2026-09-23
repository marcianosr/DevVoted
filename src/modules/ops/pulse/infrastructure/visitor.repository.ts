import { createHmac } from "node:crypto";

import {
	getRequestHeader,
	getRequestHost,
	getRequestIP,
} from "@tanstack/react-start/server";

import {
	countryOf,
	deviceClassOf,
	referrerHostOf,
	type DeviceClass,
} from "~/modules/ops/pulse/domain/visit.model";

/**
 * What one request says about its sender, read once. Kept as a value so every
 * decision below it is a pure function of it: `@tanstack/react-start/server` is
 * replaced by import protection under vitest, so anything calling it directly
 * cannot be unit tested.
 */
export type RequestFacts = {
	readonly ip: string;
	readonly userAgent: string;
	readonly country: string | null;
	readonly referer: string | null;
	readonly selfHost: string;
	readonly fetchSite: string | null;
	readonly origin: string | null;
};

export type VisitorContext = {
	readonly visitorHash: string;
	readonly device: DeviceClass;
	readonly country: string | null;
	readonly referrerHost: string | null;
};

const HASH_LENGTH = 32;

/**
 * Vercel's edge sets the first two itself, so a client cannot forge them. h3's
 * helper reads the leftmost `x-forwarded-for` entry, which IS client-supplied
 * where a proxy appends rather than overwrites — hence last. A forged address
 * only mints extra identities for the forger; it can never impersonate another
 * visitor, because the hash is one-way.
 */
const clientIpOf = (): string =>
	getRequestHeader("x-vercel-forwarded-for") ??
	getRequestHeader("x-real-ip") ??
	getRequestIP({ xForwardedFor: true }) ??
	"unknown";

/** The only place the incoming request is touched. */
export const readRequestFacts = (): RequestFacts => ({
	ip: clientIpOf(),
	userAgent: getRequestHeader("user-agent") ?? "",
	country: getRequestHeader("x-vercel-ip-country") ?? null,
	referer: getRequestHeader("referer") ?? null,
	selfHost: getRequestHost({ xForwardedHost: true }),
	fetchSite: getRequestHeader("sec-fetch-site") ?? null,
	origin: getRequestHeader("origin") ?? null,
});

/**
 * The key is re-derived from the calendar date, so it rotates at local midnight
 * with no scheduler and no stored state. That rotation is what makes a visitor
 * unlinkable across days — and it is exactly why signed-out retention cannot be
 * measured. A missing secret returns null and the whole path goes quiet, so a
 * misconfiguration reads as no data rather than as weak data.
 */
const dailySalt = (date: string): string | null => {
	const secret = process.env.VISIT_HASH_SECRET;
	if (!secret) return null;
	return createHmac("sha256", secret).update(date).digest("base64url");
};

/**
 * The IP itself is never stored. `\n` separates the parts so no crafted
 * address-and-agent pair can collide with another by shifting the boundary.
 */
export const visitorHashOf = (
	date: string,
	ip: string,
	userAgent: string
): string | null => {
	const salt = dailySalt(date);
	if (!salt) return null;
	return createHmac("sha256", salt)
		.update(`${ip}\n${userAgent}`)
		.digest("hex")
		.slice(0, HASH_LENGTH);
};

export const visitorContextOf = (
	date: string,
	facts: RequestFacts
): VisitorContext | null => {
	const visitorHash = visitorHashOf(date, facts.ip, facts.userAgent);
	if (!visitorHash) return null;

	return {
		visitorHash,
		device: deviceClassOf(facts.userAgent),
		country: countryOf(facts.country),
		referrerHost: referrerHostOf(facts.referer, facts.selfHost),
	};
};

/**
 * `sec-fetch-site: none` must pass: that is a direct address-bar load, which is
 * the entry visit this exists to count.
 */
export const isSameOrigin = (facts: RequestFacts): boolean => {
	if (facts.fetchSite)
		return facts.fetchSite === "same-origin" || facts.fetchSite === "none";
	if (facts.origin) return facts.origin.endsWith(facts.selfHost);
	return true;
};
