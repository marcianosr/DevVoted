import type { GateType } from "~/domains/gates/models/gateType";
import { GATE_PROGRESSION } from "~/domains/runs/data/gates/gate-progression";
import type { GateDefinition } from "~/domains/runs/services/thresholdCalculator.service";

/**
 * Generates a GateDefinition based on gate type and gate number.
 *
 * Uses the universal GATE_PROGRESSION for threshold requirements.
 * Gate types only modify behavior (pollsPerGate, modifiers), not thresholds.
 */
export const generateGateDefinition = (
	gateType: GateType,
	gateNumber: number
): GateDefinition => {
	// Use progression gate if available, otherwise extrapolate
	const progressionGate = GATE_PROGRESSION[gateNumber - 1];

	if (progressionGate) {
		return {
			...progressionGate,
			gate: gateNumber,
			pollsPerGate: gateType.pollsPerGate,
		};
	}

	// Extrapolate from last defined gate for gates beyond progression
	const lastDefinedGate = GATE_PROGRESSION[GATE_PROGRESSION.length - 1];
	const gatesBeyond = gateNumber - GATE_PROGRESSION.length;
	const thresholdIncrement = 5;

	return {
		gate: gateNumber,
		requirements: lastDefinedGate.requirements.map((req) => ({
			...req,
			threshold: Math.min(
				req.threshold + gatesBeyond * thresholdIncrement,
				100
			),
		})),
		evaluationMode: lastDefinedGate.evaluationMode,
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
