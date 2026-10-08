import { useEffect, useState } from "react";

import {
	FIRST_STEP,
	type LoginDemoStep,
	SETTLED_STEP,
	nextStep,
	waitFor,
} from "~/modules/account/auth/application/loginDemo.viewmodel";
import { prefersReducedMotion } from "~/ui/kanto-theme/useRevealBeats.hook";

export const useLoginDemo = (): LoginDemoStep => {
	const [step, setStep] = useState<LoginDemoStep>(FIRST_STEP);

	useEffect(() => {
		if (prefersReducedMotion()) {
			setStep(SETTLED_STEP);
			return;
		}
		const id = setTimeout(() => setStep(nextStep(step)), waitFor(step));
		return () => clearTimeout(id);
	}, [step]);

	return step;
};
