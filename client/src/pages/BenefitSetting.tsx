import useAxios from '@/hooks/useAxios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { set } from 'date-fns';
import { Info } from 'lucide-react';
import React, { useState } from 'react';

type TBenefitSettings = {
	id: number;
	sss_share: number;
	philhealth_share: number;
	pagibig_share: number;
	created_at: string;
	updated_at: string;
};

type TBenefitType = 'sss_share' | 'philhealth_share' | 'pagibig_share';

const BenefitSetting = () => {
	const api = useAxios();
	const queryClient = useQueryClient();

	const [SSSInput, setSSSInput] = useState(0);
	const [philHealthInput, setPhilHealthInput] = useState(0);
	const [pagIBIGInput, setPagIBIGInput] = useState(0);

	const [openSSSEditModal, setOpenSSSEditModal] = useState(false);
	const [openPhilHealthEditModal, setOpenPhilHealthEditModal] = useState(false);
	const [openPagIBIGEditModal, setOpenPagIBIGEditModal] = useState(false);

	const settings_benefits_query = useQuery({
		queryKey: ['settings-benefits'],
		queryFn: async () => {
			const response = await api.get('/benefits');
			return response.data as TBenefitSettings;
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (data: Partial<TBenefitSettings>) => {
			const response = await api.put(`/benefits/${settings_benefits_query.data?.id}`, data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['settings-benefits'] });
			setOpenSSSEditModal(false);
			setOpenPhilHealthEditModal(false);
			setOpenPagIBIGEditModal(false);
		},
		onError: (error: any) => {
			alert('Error updating benefits settings: ' + error.message);
		},
	});

	const handleSaveSSS = async () => {
		updateMutation.mutate({ sss_share: SSSInput }); // Replace with actual value from input
	};
	const handleSavePhilhealth = async () => {
		updateMutation.mutate({ philhealth_share: philHealthInput }); // Replace with actual value from input
	};
	const handleSavePagIbig = async () => {
		updateMutation.mutate({ pagibig_share: pagIBIGInput }); // Replace with actual value from input
	};

	if (settings_benefits_query.isPending) {
		return (
			<main className="bg-slate-50 min-h-screen w-full">
				<div className="max-w-6xl mx-auto p-4">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-slate-200 rounded w-1/3"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
							))}
						</div>
					</div>
				</div>
			</main>
		);
	}

	if (settings_benefits_query.isError) {
		return (
			<main className="bg-slate-50 min-h-screen w-full">
				<div className="max-w-6xl mx-auto p-4">
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-700 font-medium">Error loading benefit settings</p>
					</div>
				</div>
			</main>
		);
	}

	return (
		<>
			<main className="bg-slate-50 min-h-screen w-full">
				<div className="max-w-6xl mx-auto p-4 space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-slate-900">Benefit Settings</h1>
							<p className="text-sm text-slate-600 mt-1">Configure and manage employer benefit contributions</p>
						</div>
					</div>
					{/* Info Card */}
					<div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-4">
						<Info size={16} />
						<p className="text-xs text-slate-800">
							These settings represent the employer's contribution percentage for each benefit scheme. Update these values to reflect your organization's benefit policy.
						</p>
					</div>
					{/* Benefit Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* SSS Card */}
						<div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-slate-300 transition">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<h3 className="font-medium text-slate-700">SSS</h3>
								</div>
							</div>
							<div className="mb-4">
								<p className="text-2xl font-bold text-slate-900">{settings_benefits_query.data?.sss_share || 0}%</p>
								<p className="text-xs text-slate-500 mt-1">Employer Share</p>
							</div>
							<button
								onClick={() => setOpenSSSEditModal(true)}
								className="w-full px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
							>
								Edit
							</button>
						</div>
						{/* PhilHealth Card */}
						<div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-slate-300 transition">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<h3 className="font-medium text-slate-700">Philhealth</h3>
								</div>
							</div>
							<div className="mb-4">
								<p className="text-2xl font-bold text-slate-900">{settings_benefits_query.data?.philhealth_share || 0}%</p>
								<p className="text-xs text-slate-500 mt-1">Employer Share</p>
							</div>
							<button
								onClick={() => setOpenPhilHealthEditModal(true)}
								className="w-full px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
							>
								Edit
							</button>
						</div>
						<div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-slate-300 transition">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<h3 className="font-medium text-slate-700">Pag-IBIG</h3>
								</div>
							</div>
							<div className="mb-4">
								<p className="text-2xl font-bold text-slate-900">PHP {settings_benefits_query.data?.pagibig_share || 0}</p>
								<p className="text-xs text-slate-500 mt-1">Employer Share</p>
							</div>
							<button
								onClick={() => setOpenPagIBIGEditModal(true)}
								className="w-full px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
							>
								Edit
							</button>
						</div>
					</div>
				</div>
			</main>

			{/* Edit Modal */}
			{openSSSEditModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 w-96">
						<h2 className="text-lg font-semibold text-slate-900 mb-4">Edit SSS Benefit</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Employer Share (%)</label>
								<input
									type="number"
									defaultValue={settings_benefits_query.data?.sss_share || 0}
									onChange={(e) => setSSSInput(parseFloat(e.target.value))}
									className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter percentage"
								/>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setOpenSSSEditModal(false)}
								disabled={updateMutation.isPending}
								className="text-sm flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium transition disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveSSS}
								disabled={updateMutation.isPending}
								className="text-sm flex-1 px-4 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-medium transition disabled:opacity-50"
							>
								{updateMutation.isPending ? 'Saving...' : 'Save'}
							</button>
						</div>
					</div>
				</div>
			)}

			{openPhilHealthEditModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 w-96">
						<h2 className="text-lg font-semibold text-slate-900 mb-4">Edit PhilHealth Benefit</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Employer Share (%)</label>
								<input
									type="number"
									defaultValue={settings_benefits_query.data?.philhealth_share || 0}
									onChange={(e) => setPhilHealthInput(parseFloat(e.target.value))}
									className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter percentage"
								/>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setOpenPhilHealthEditModal(false)}
								disabled={updateMutation.isPending}
								className="text-sm flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium transition disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleSavePhilhealth}
								disabled={updateMutation.isPending}
								className="text-sm flex-1 px-4 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-medium transition disabled:opacity-50"
							>
								{updateMutation.isPending ? 'Saving...' : 'Save'}
							</button>
						</div>
					</div>
				</div>
			)}

			{openPagIBIGEditModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 w-96">
						<h2 className="text-lg font-semibold text-slate-900 mb-4">Edit Pag-IBIG Benefit</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Employer Share (%)</label>
								<input
									type="number"
									defaultValue={settings_benefits_query.data.pagibig_share}
									onChange={(e) => setPagIBIGInput(parseFloat(e.target.value))}
									className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Enter percentage"
								/>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => setOpenPagIBIGEditModal(false)}
								disabled={updateMutation.isPending}
								className="text-sm flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium transition disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleSavePagIbig}
								disabled={updateMutation.isPending}
								className="text-sm flex-1 px-4 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-medium transition disabled:opacity-50"
							>
								{updateMutation.isPending ? 'Saving...' : 'Save'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BenefitSetting;
