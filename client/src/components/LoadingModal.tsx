import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
	open: boolean;
	message?: string;
}

const LoadingModal = ({ open, message = 'Please wait...' }: LoadingModalProps) => {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

			{/* Modal */}
			<div className="relative flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-xl">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
					<Loader2 size={28} className="animate-spin text-slate-500" />
				</div>
				<div className="text-center">
					<p className="text-sm font-medium text-slate-700">{message}</p>
					<p className="mt-1 text-xs text-slate-400">This may take a moment</p>
				</div>
			</div>
		</div>
	);
};

export default LoadingModal;
