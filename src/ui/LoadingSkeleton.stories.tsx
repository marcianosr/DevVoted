import type { Meta, StoryObj } from "@storybook/react";
import { LoadingSkeleton } from "./LoadingSkeleton.component";

const meta: Meta<typeof LoadingSkeleton> = {
	component: LoadingSkeleton,
	title: "Atoms/Loading Skeleton",
};
export default meta;

type Story = StoryObj<typeof LoadingSkeleton>;

export const Default: Story = {};
