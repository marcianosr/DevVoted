import type { GateType } from "~/domains/gates/models/gateType";
import { VANILLA_CI_GATES } from "~/domains/runs/data/gates/vanilla";
import type { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

/**
 * Generates a GateDefinition based on gate type and gate number.
 *
 * For now, uses vanilla scaling as a placeholder.
 * Later: each gate type can have its own scaling formula.
 */
export const generateGateDefinition = (
	gateType: GateType,
	gateNumber: number
): GateDefinition => {
	// Use vanilla gate if available, otherwise extrapolate
	const vanillaGate = VANILLA_CI_GATES[gateNumber - 1];

	if (vanillaGate) {
		return {
			...vanillaGate,
			gate: gateNumber,
			pollsPerGate: gateType.pollsPerGate,
		};
	}

	// Extrapolate from last vanilla gate for gates beyond defined
	const lastVanillaGate = VANILLA_CI_GATES[VANILLA_CI_GATES.length - 1];
	const gatesBeyond = gateNumber - VANILLA_CI_GATES.length;
	const thresholdIncrement = 5;

	return {
		gate: gateNumber,
		requirements: lastVanillaGate.requirements.map((req) => ({
			...req,
			threshold: Math.min(
				req.threshold + gatesBeyond * thresholdIncrement,
				100
			),
		})),
		evaluationMode: lastVanillaGate.evaluationMode,
		pollsPerGate: gateType.pollsPerGate,
	};
};

/**
 * Builds an array of GateDefinitions from run gate history.
 * This allows the existing thresholdCalculator functions to work with dynamic gates.
 */
export const buildGatesFromHistory = (
	gateHistory: Array<{ gateNumber: number; gateType: GateType }>
): GateDefinition[] => {
	return gateHistory.map(({ gateNumber, gateType }) =>
		generateGateDefinition(gateType, gateNumber)
	);
};

/**
 * Generates a single gate definition for the current gate.
 * Used when we only need the current gate's definition.
 */
export const getCurrentGateDefinition = (
	gateType: GateType,
	gateNumber: number
): GateDefinition => {
	return generateGateDefinition(gateType, gateNumber);
};
