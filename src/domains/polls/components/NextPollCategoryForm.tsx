import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { getCategories } from "~/domains/shared/categories";
import { PrimaryButton } from "~/ui/PrimaryButton";

import { postNextCategoryPoll } from "../api/polls";

const NextPollCategoryForm = () => {
	const mutation = useMutation({
		mutationFn: postNextCategoryPoll,
		onSuccess: () => {
			console.log("Successfully voted for category");
		},
		onError: (error) => {
			console.error("Error voting for category:", error);
		},
	});
	const { Field, handleSubmit } = useForm({
		onSubmit: async ({ value }) => {
			mutation.mutate({
				data: {
					categoryCode: value.categoryCode,
				},
			});
		},
	});

	return (
		<>
			<h3 className="text-2xl mt-16">Vote for tomorrow&apos;s category</h3>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<Field
					name="categoryCode"
					validators={{
						onSubmit: ({ value }) => {
							if (!value) {
								return "Please select at least one answer";
							}
							return undefined;
						},
					}}
				>
					{(field) => {
						return (
							<ul>
								{getCategories().map((category) => (
									<li key={category.code}>
										<input
											type="radio"
											name="category"
											value={category.code}
											id={category.code}
											onChange={() => field.handleChange(category.code)}
										/>{" "}
										<label htmlFor={category.code}>{category.name}</label>
									</li>
								))}
							</ul>
						);
					}}
				</Field>
				<PrimaryButton type="submit" className="mt-4">
					Submit Vote
				</PrimaryButton>
			</form>
		</>
	);
};

export default NextPollCategoryForm;
