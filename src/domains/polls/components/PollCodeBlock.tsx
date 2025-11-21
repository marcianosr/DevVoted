type PollCodeBlockProps = {
	code: string;
};

export const PollCodeBlock = ({ code }: PollCodeBlockProps) => {
	return (
		<pre className="bg-gray-800 text-gray-100 p-4 rounded my-4 overflow-x-auto">
			<code>{code}</code>
		</pre>
	);
};
