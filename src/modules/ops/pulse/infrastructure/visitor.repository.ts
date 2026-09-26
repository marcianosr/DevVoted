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

const clientIpOf = (): string =>
	getRequestHeader("x-vercel-forwarded-for") ??
	getRequestHeader("x-real-ip") ??
	getRequestIP({ xForwardedFor: true }) ??
	"unknown";

export const readRequestFacts = (): RequestFacts => ({
	ip: clientIpOf(),
	userAgent: getRequestHeader("user-agent") ?? "",
	country: getRequestHeader("x-vercel-ip-country") ?? null,
	referer: getRequestHeader("referer") ?? null,
	selfHost: getRequestHost({ xForwardedHost: true }),
	fetchSite: getRequestHeader("sec-fetch-site") ?? null,
	origin: getRequestHeader("origin") ?? null,
});

const dailySalt = (date: string): string | null => {
	const secret = process.env.VISIT_HASH_SECRET;
	if (!secret) return null;
	return createHmac("sha256", secret).update(date).digest("base64url");
};

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

export const isSameOrigin = (facts: RequestFacts): boolean => {
	if (facts.fetchSite)
		return facts.fetchSite === "same-origin" || facts.fetchSite === "none";
	if (facts.origin) return facts.origin.endsWith(facts.selfHost);
	return true;
};
