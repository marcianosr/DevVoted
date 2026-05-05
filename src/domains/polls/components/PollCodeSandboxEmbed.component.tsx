type PollCodeSandboxEmbedProps = {
	url: string;
};

export const PollCodeSandboxEmbed = ({ url }: PollCodeSandboxEmbedProps) => {
	return (
		<div className="my-4">
			<iframe
				src={url}
				className="w-full h-96 border border-gray-600"
				title="CodeSandbox Example"
				allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
				sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
			/>
		</div>
	);
};
