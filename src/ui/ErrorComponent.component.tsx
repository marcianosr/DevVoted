type ErrorComponentProps = {
	text: string;
};

export const ErrorComponent = ({ text }: ErrorComponentProps) => (
	<div className="p-4">
		<h1 className="text-2xl mb-4 text-red-600">{text}</h1>
	</div>
);
