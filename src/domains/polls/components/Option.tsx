import { PollOption } from "~/domains/polls/models/pollOption";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

// Define a simplified field interface that matches what we need from TanStack Form
type FormFieldApi = {
	state: {
		value: string[];
	};
	setValue: (value: string[]) => void;
};

type OptionProps = {
	option: PollOption;
	type: "radio" | "checkbox";
	field: FormFieldApi;
	checked: boolean;
	disabled?: boolean;
};

type HandleOptionsChangeParams = {
	e: React.ChangeEvent<HTMLInputElement>;
	field: FormFieldApi;
	type: "radio" | "checkbox";
	optionValue: string;
};
export const handleOptionsChange = ({
	e,
	field,
	type,
	optionValue,
}: HandleOptionsChangeParams) => {
	const currentValues = [...field.state.value];
	const isChecked = e.target.checked;

	if (type === "radio" && isChecked) {
		// For radio buttons, replace the entire selection
		field.setValue([optionValue]);
		return;
	}

	// For checkboxes, add or remove based on checkbox state
	const newValues = isChecked
		? [...currentValues, optionValue]
		: currentValues.filter((val) => val !== optionValue);

	field.setValue(newValues);
};

const Option = ({
	option,
	type,
	field,
	checked,
	disabled = false,
}: OptionProps) => {
	const inputId = `option-${option.id}`;
	const optionValue = option.id.toString();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleOptionsChange({ e, field, type, optionValue });
	};

	return (
		<div
			className={`flex items-start gap-2 ${disabled ? "opacity-50" : ""}`}
		>
			<input
				type={type}
				name="selectedOptions"
				value={optionValue}
				id={inputId}
				checked={checked}
				onChange={handleChange}
				disabled={disabled}
				className={`mt-1 w-5 h-5 bg-zinc-900 border-2 border-theme accent-theme ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
			/>
			<label
				htmlFor={inputId}
				className={`markdown flex-1 ${disabled ? "cursor-not-allowed text-gray-500" : "cursor-pointer"}`}
			>
				<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
					{option.option}
				</ReactMarkdown>
			</label>
		</div>
	);
};

export default Option;
