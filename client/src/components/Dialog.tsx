import { Info } from 'lucide-react';

interface DialogModalProps {
	isOpen: boolean;
	content: {
		title: string;
		message: string;
	};
	icon?: React.ReactNode;
	children: React.ReactNode;
}

const Dialog = ({ children, isOpen, content, icon }: DialogModalProps) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

			<div className="relative bg-white rounded-2xl shadow-lg p-6 m-2 w-full max-w-sm">
				<div className="mb-4 flex flex-col justify-center items-center">
					{icon || <Info className="text-slate-900" size={30} />}
					<div className="text-center mt-4">
						<h2 className="text-lg font-medium text-slate-700">{content.title}</h2>
						<p className="mt-1 text-xs font-normal text-slate-500">{content.message}</p>
					</div>
				</div>

				<div className="flex flex-col items-center justify-center w-full">{children}</div>
			</div>
		</div>
	);
};

export default Dialog;
