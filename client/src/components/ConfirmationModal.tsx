import { Archive, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	type: 'delete' | 'archive';
	isLoading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmationModal = ({ isOpen, title, message, type, isLoading = false, onConfirm, onCancel }: ConfirmationModalProps) => {
	if (!isOpen) return null;

	const isDelete = type === 'delete';
	const iconBgColor = isDelete ? '#fee2e2' : '#fef3c7';
	const iconColor = isDelete ? 'text-red-600' : 'text-amber-600';
	const confirmButtonColor = isDelete ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white';
	const Icon = isDelete ? Trash2 : Archive;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

			{/* Modal */}
			<div className="relative z-10 flex flex-col gap-6 rounded-2xl bg-white px-6 py-8 shadow-xl max-w-sm w-full">
				{/* Icon */}
				<div className="flex h-14 w-14 items-center justify-center rounded-full mx-auto" style={{ backgroundColor: iconBgColor }}>
					<Icon size={28} className={iconColor} />
				</div>

				{/* Content */}
				<div className="text-center">
					<h2 className="text-lg font-semibold text-slate-900">{title}</h2>
					<p className="mt-2 text-sm text-slate-600">{message}</p>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<button
						onClick={onCancel}
						disabled={isLoading}
						className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonColor}`}
					>
						{isLoading ? (
							<span className="inline-flex items-center gap-2">
								<span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								{isDelete ? 'Deleting...' : 'Archiving...'}
							</span>
						) : isDelete ? (
							'Delete'
						) : (
							'Archive'
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
