import Button from '@/components/Button';
import LoadingModal from '@/components/LoadingModal';
import api from '@/config/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { FileText, Plus, SquarePen, X, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';

const StatutoryBenefitsSettings = () => {
	const queryClient = useQueryClient();

	const sssEditECInputRef = useRef<HTMLInputElement>(null);
	const sssEditRateInputRef = useRef<HTMLInputElement>(null);
	const sssEditMPFInputRef = useRef<HTMLInputElement>(null);

	const philHealthRateEditInputRef = useRef<HTMLInputElement>(null);

	const pagibigRateInputRef = useRef<HTMLInputElement>(null);

	const [philhealthSettings, setPhilhealthSettings] = useState({ philhealth_er_rate: 5 });
	const [pagibigSettings, setPagIBIGSettings] = useState({ pagibig_er_share_rate: 2 });
	const [sssSettings, setSSSSettings] = useState({ sss_ec_amount: 10, sss_er_share_rate: 5, sss_mpf_amount: 0 });

	const [openSSSModal, setOpenSSSModal] = useState(false);
	const [openPhilHealthModal, setOpenPhilHealthModal] = useState(false);
	const [openPagIBIGModal, setOpenPagIBIGModal] = useState(false);

	const [openEditSSSModal, setOpenEditSSSModal] = useState(false);
	const [openEditPhilHealthModal, setOpenEditPhilHealthModal] = useState(false);
	const [openEditPagIBIGModal, setOpenEditPagIBIGModal] = useState(false);

	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Something went wrong. Please try again later.');

	const statutory_benefits_query = useQuery({
		queryKey: ['statutory_benefits'],
		queryFn: async () => {
			const response = await api.get('/benefits');
			return response.data;
		},
	});

	const add_benefits_mutation = useMutation({
		mutationFn: async (data: any) => {
			const response = await api.post(`/benefits?type=${data.type}`, data);
			return response.data;
		},

		onError: (error) => {
			if (isAxiosError(error)) {
				console.error('Error details:', {
					status: error.response?.status,
					data: error.response?.data,
					headers: error.response?.headers,
				});
			}
		},
	});

	const edit_benefits_mutation = useMutation({
		mutationFn: async (data: any) => {
			const response = await api.put(`/benefits/${data.id}?type=${data.type}`, data);
			return response.data;
		},

		onError: (error) => {
			if (isAxiosError(error)) {
				console.error('Error details:', {
					status: error.response?.status,
					data: error.response?.data,
					headers: error.response?.headers,
				});
			}
		},
	});

	const handleAddSSS = async () => {
		const payload = {
			type: 'sss',
			er_share_rate: sssSettings.sss_er_share_rate,
			ec_amount: sssSettings.sss_ec_amount,
			mpf_amount: sssSettings.sss_mpf_amount,
		};
		console.log(payload);
		add_benefits_mutation.mutate(payload, {
			onSuccess: () => {
				setOpenSSSModal(false);
				queryClient.invalidateQueries({ queryKey: ['statutory_benefits'] });
			},
		});
	};

	const handleAddPhilHealth = async () => {
		const payload = {
			type: 'philhealth',
			philhealth_er_rate: philhealthSettings.philhealth_er_rate,
		};
		add_benefits_mutation.mutate(payload, {
			onSuccess: () => {
				setOpenPhilHealthModal(false);
				queryClient.invalidateQueries({ queryKey: ['statutory_benefits'] });
			},
		});
	};

	const handleAddPagIBIG = async () => {
		const payload = {
			type: 'pagibig',
			pagibig_er_share_rate: pagibigSettings.pagibig_er_share_rate,
		};
		add_benefits_mutation.mutate(payload, {
			onSuccess: () => {
				setOpenPagIBIGModal(false);
				queryClient.invalidateQueries({ queryKey: ['statutory_benefits'] });
			},
		});
	};

	const handleEditSSSSave = async () => {
		const payload = {
			type: 'sss',
			id: statutory_benefits_query.data?.sss?.id,
			er_share_rate: parseFloat(sssEditRateInputRef.current?.value || '0'),
			ec_amount: parseFloat(sssEditECInputRef.current?.value || '0'),
			mpf_amount: parseFloat(sssEditMPFInputRef.current?.value || '0'),
		};
		console.log(payload);
		edit_benefits_mutation.mutate(payload, {
			onSuccess: () => {
				setOpenEditSSSModal(false);
				queryClient.invalidateQueries({ queryKey: ['statutory_benefits'] });
			},
		});
	};

	const handleEditPhilHealthSave = async () => {
		const payload = {
			type: 'philhealth',
			id: statutory_benefits_query.data?.philhealth?.id,
			er_rate: parseFloat(philHealthRateEditInputRef.current?.value || '0'),
		};

		edit_benefits_mutation.mutate(payload, {
			onSuccess: () => {
				setOpenEditPhilHealthModal(false);
				queryClient.invalidateQueries({ queryKey: ['statutory_benefits'] });
			},
		});
	};

	const handleEditPagIBIGSave = async () => {
		const payload = {
			type: 'pagibig',
			id: statutory_benefits_query.data?.pagibig?.id,
			er_share_rate: parseFloat(pagibigRateInputRef.current?.value || '0'),
		};
		edit_benefits_mutation.mutate(payload, {
			onSuccess: () => {
				setOpenEditPagIBIGModal(false);
				queryClient.invalidateQueries({ queryKey: ['statutory_benefits'] });
			},
		});
	};

	if (statutory_benefits_query.isPending) {
		return (
			<div className="w-full min-h-screen p-4 bg-slate-50">
				<div className="space-y-2">
					<div className="h-7 max-w-56 bg-slate-200 rounded animate-pulse"></div>
					<div className="h-5 max-w-96 bg-slate-200 rounded animate-pulse"></div>
				</div>
				<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
							<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
								<div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
								<div className="h-9 w-16 bg-slate-200 rounded animate-pulse"></div>
							</div>
							<div className="p-6 space-y-4">
								<div className="space-y-2">
									<div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
									<div className="h-8 w-full bg-slate-200 rounded animate-pulse"></div>
								</div>
								<div className="space-y-2">
									<div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
									<div className="h-8 w-full bg-slate-200 rounded animate-pulse"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (statutory_benefits_query.isError) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-lg text-red-500">An error occurred while fetching statutory benefits settings.</p>
			</div>
		);
	}

	return (
		<>
			<main className="bg-slate-50 min-h-screen w-full">
				<div className="container mx-auto p-4 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-lg font-medium text-slate-700">Company Benefits</h2>
							<p className="text-sm text-slate-500">Manage statutory benefits settings for your company</p>
						</div>
					</div>
					{/* Statutory Deductions & Settings Section */}
					<div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
						<div className="flex items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
							<FileText className="w-5 h-5 text-slate-600" />
							<h2 className="text-md font-semibold text-slate-900">Statutory Deductions & Benefits</h2>
						</div>
						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* SSS */}
								{statutory_benefits_query.data?.sss ? (
									<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
										<div className="flex items-center justify-between mb-4">
											<h3 className="font-semibold text-slate-900">SSS</h3>
											<button onClick={() => setOpenEditSSSModal(true)}>
												<SquarePen size={16} className=" text-slate-600" />
											</button>
										</div>
										<div className="space-y-3">
											<div>
												<p className="text-xs text-slate-600 uppercase font-semibold">Employer Compensation Amount</p>
												<p className="text-sm font-medium text-slate-900 mt-1">₱{(statutory_benefits_query.data?.sss?.ec_amount || 0).toFixed(2)}</p>
											</div>
											<div>
												<p className="text-xs text-slate-600 uppercase font-semibold">Employer Share Rate</p>
												<p className="text-sm font-medium text-slate-900 mt-1">{statutory_benefits_query.data?.sss?.er_share_rate || 0}%</p>
											</div>
											<div>
												<p className="text-xs text-slate-600 uppercase font-semibold">Mandatory Provident Fund Amount</p>
												<p className="text-sm font-medium text-slate-900 mt-1">₱{(statutory_benefits_query.data?.sss?.mpf_amount || 0).toFixed(2)}</p>
											</div>
										</div>
									</div>
								) : (
									<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
										<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">SSS</h3>
										<p className="text-sm font-medium text-slate-900 mt-1">No SSS settings found for employees of the company.</p>
										<Button
											theme="outline"
											text="Add SSS Settings"
											icon={{
												position: 'left',
												content: <Plus size={16} />,
											}}
											className="mt-4"
											onClick={() => {
												setOpenSSSModal(true);
											}}
										/>
									</div>
								)}

								{/* PhilHealth */}
								{statutory_benefits_query.data?.philhealth ? (
									<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
										<div className="flex items-center justify-between mb-4">
											<h3 className="font-semibold text-slate-900">PhilHealth</h3>
											<button onClick={() => setOpenEditPhilHealthModal(true)}>
												<SquarePen size={16} className=" text-slate-600" />
											</button>
										</div>
										<div className="space-y-3">
											<div>
												<p className="text-xs text-slate-600 uppercase font-semibold">Employer Share Rate</p>
												<p className="text-sm font-medium text-slate-900 mt-1">{statutory_benefits_query.data?.philhealth?.philhealth_er_rate || 0}%</p>
											</div>
										</div>
									</div>
								) : (
									<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
										<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">PhilHealth</h3>
										<p className="text-sm font-medium text-slate-900 mt-1">No PhilHealth settings found for employees of the company.</p>
										<Button
											theme="outline"
											text="Add PhilHealth Settings"
											icon={{
												position: 'left',
												content: <Plus size={16} />,
											}}
											className="mt-4"
											onClick={() => {
												setOpenPhilHealthModal(true);
											}}
										/>
									</div>
								)}

								{/* Pag-IBIG */}
								{statutory_benefits_query.data?.pagibig ? (
									<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
										<div className="flex items-center justify-between mb-4">
											<h3 className="font-semibold text-slate-900">Pag-IBIG</h3>
											<button onClick={() => setOpenEditPagIBIGModal(true)}>
												<SquarePen size={16} className=" text-slate-600" />
											</button>
										</div>
										<div className="space-y-3">
											<div>
												<p className="text-xs text-slate-600 uppercase font-semibold">Employer Share Rate</p>
												<p className="text-sm font-medium text-slate-900 mt-1">{statutory_benefits_query.data?.pagibig?.pagibig_er_share_rate || 0}%</p>
											</div>
										</div>
									</div>
								) : (
									<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
										<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">Pag-IBIG</h3>
										<p className="text-sm font-medium text-slate-900 mt-1">No Pag-IBIG settings found for employees of the company.</p>
										<Button
											theme="outline"
											text="Add Pag-IBIG Settings"
											icon={{
												position: 'left',
												content: <Plus size={16} />,
											}}
											className="mt-4"
											onClick={() => {
												setOpenPagIBIGModal(true);
											}}
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>

			{openSSSModal && (
				<>
					<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-y-auto">
							{/* Modal Header */}
							<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
								<h3 className="text-lg font-semibold text-slate-900">Edit SSS Information</h3>
								<button onClick={() => setOpenSSSModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="grid grid-cols-1 gap-4 px-6 py-4">
								<div className="flex flex-col gap-2">
									<label htmlFor="sss_ec" className="block text-sm font-medium text-slate-700">
										Employees' Compensation (EC) Amount
									</label>
									<input
										type="number"
										id="sss_ec"
										min={0}
										value={sssSettings.sss_ec_amount}
										onChange={(e) => setSSSSettings((prev) => ({ ...prev, sss_ec_amount: parseFloat(e.target.value) }))}
										placeholder="XX-XXXXXXX-X"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label htmlFor="sss_ee_share" className="block text-sm font-medium text-slate-700">
										Employer Share Rate (%)
									</label>
									<input
										type="number"
										id="sss_ee_share"
										value={sssSettings.sss_er_share_rate}
										onChange={(e) => setSSSSettings((prev) => ({ ...prev, sss_er_share_rate: parseFloat(e.target.value) }))}
										placeholder="10"
										min={0}
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label htmlFor="sss_mpf" className="block text-sm font-medium text-slate-700">
										Mandatory Provident Fund Amount
									</label>
									<input
										type="number"
										id="sss_mpf"
										value={sssSettings.sss_mpf_amount}
										onChange={(e) => setSSSSettings((prev) => ({ ...prev, sss_mpf_amount: parseFloat(e.target.value) }))}
										placeholder="0.00"
										min={0}
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 px-6 py-4">
								<Button text="Cancel" onClick={() => setOpenSSSModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handleAddSSS} />
							</div>
						</div>
					</div>
				</>
			)}
			{openPhilHealthModal && (
				<>
					<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
							{/* Modal Header */}
							<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
								<h3 className="text-lg font-semibold text-slate-900">Edit PhilHealth Information</h3>
								<button onClick={() => setOpenPhilHealthModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
								<div className="flex flex-col gap-2">
									<label htmlFor="philhealth_er_rate" className="block text-sm font-medium text-slate-700">
										PhilHealth ER Rate (%)
									</label>
									<input
										type="number"
										id="philhealth_er_rate"
										value={philhealthSettings.philhealth_er_rate}
										onChange={(e) => setPhilhealthSettings((prev) => ({ ...prev, philhealth_er_rate: parseFloat(e.target.value) }))}
										placeholder="5"
										min={0}
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 px-6 py-4">
								<Button text="Cancel" onClick={() => setOpenPhilHealthModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handleAddPhilHealth} />
							</div>
						</div>
					</div>
				</>
			)}
			{openPagIBIGModal && (
				<>
					<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full  overflow-y-auto">
							{/* Modal Header */}
							<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
								<h3 className="text-lg font-semibold text-slate-900">Edit PagIbig Information</h3>
								<button onClick={() => setOpenPagIBIGModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
								<div className="flex flex-col gap-2">
									<label htmlFor="pagibig_ee_share" className="block text-sm font-medium text-slate-700">
										Employer Share Rate (%)
									</label>
									<input
										type="number"
										id="pagibig_ee_share"
										value={pagibigSettings.pagibig_er_share_rate}
										onChange={(e) => setPagIBIGSettings((prev) => ({ ...prev, pagibig_er_share_rate: parseFloat(e.target.value) }))}
										placeholder="2"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 p-4">
								<Button text="Cancel" onClick={() => setOpenPagIBIGModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handleAddPagIBIG} />
							</div>
						</div>
					</div>
				</>
			)}

			{openEditSSSModal && (
				<>
					<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-y-auto">
							{/* Modal Header */}
							<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
								<h3 className="text-lg font-semibold text-slate-900">Edit SSS Information</h3>
								<button onClick={() => setOpenEditSSSModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="grid grid-cols-1 gap-4 px-6 py-4">
								<div className="flex flex-col gap-2">
									<label htmlFor="sss_ec" className="block text-sm font-medium text-slate-700">
										Employees' Compensation (EC) Amount
									</label>
									<input
										type="text"
										id="sss_ec"
										defaultValue={statutory_benefits_query.data?.sss?.ec_amount}
										ref={sssEditECInputRef}
										placeholder="XX-XXXXXXX-X"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label htmlFor="sss_ee_share" className="block text-sm font-medium text-slate-700">
										Employer Share Rate (%)
									</label>
									<input
										type="number"
										id="sss_ee_share"
										ref={sssEditRateInputRef}
										defaultValue={statutory_benefits_query.data?.sss?.er_share_rate}
										placeholder="10"
										step="0.01"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label htmlFor="sss_mpf" className="block text-sm font-medium text-slate-700">
										Mandatory Provident Fund Amount
									</label>
									<input
										type="number"
										id="sss_mpf"
										ref={sssEditMPFInputRef}
										defaultValue={statutory_benefits_query.data?.sss?.mpf_amount}
										placeholder="0.00"
										step="1"
										min={0}
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 px-6 py-4">
								<Button text="Cancel" onClick={() => setOpenEditSSSModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handleEditSSSSave} />
							</div>
						</div>
					</div>
				</>
			)}
			{openEditPhilHealthModal && (
				<>
					<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
							{/* Modal Header */}
							<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
								<h3 className="text-lg font-semibold text-slate-900">Edit PhilHealth Information</h3>
								<button onClick={() => setOpenEditPhilHealthModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
								<div className="flex flex-col gap-2">
									<label htmlFor="philhealth_ee_rate" className="block text-sm font-medium text-slate-700">
										PhilHealth Employer Share Rate (%)
									</label>
									<input
										type="number"
										id="philhealth_ee_rate"
										ref={philHealthRateEditInputRef}
										defaultValue={statutory_benefits_query.data?.philhealth?.philhealth_er_rate}
										placeholder="12"
										step="1"
										min={0}
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 px-6 py-4">
								<Button text="Cancel" onClick={() => setOpenEditPhilHealthModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handleEditPhilHealthSave} />
							</div>
						</div>
					</div>
				</>
			)}
			{openEditPagIBIGModal && (
				<>
					<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full  overflow-y-auto">
							{/* Modal Header */}
							<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
								<h3 className="text-lg font-semibold text-slate-900">Edit PagIbig Information</h3>
								<button onClick={() => setOpenEditPagIBIGModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
								<div className="flex flex-col gap-2">
									<label htmlFor="pagibig_ee_share" className="block text-sm font-medium text-slate-700">
										Employer Share Rate (%)
									</label>
									<input
										type="number"
										ref={pagibigRateInputRef}
										defaultValue={statutory_benefits_query.data?.pagibig?.pagibig_er_share_rate}
										id="pagibig_ee_share"
										placeholder="2"
										min={0}
										step="1"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 p-4">
								<Button text="Cancel" onClick={() => setOpenEditPagIBIGModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handleEditPagIBIGSave} />
							</div>
						</div>
					</div>
				</>
			)}

			{showErrorModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
						<div className="flex items-center gap-3 mb-4">
							<XCircle className="w-6 h-6 text-red-600" />
							<h3 className="text-lg font-bold text-slate-800">Error</h3>
						</div>
						<p className="text-slate-600">{errorMessage}</p>
						<button
							onClick={() => {
								setShowErrorModal(false);
								setErrorMessage('');
							}}
							className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
						>
							Close
						</button>
					</div>
				</div>
			)}

			<LoadingModal open={edit_benefits_mutation.isPending} message="updating, please wait..." />
			<LoadingModal open={add_benefits_mutation.isPending} message="Configuring, please wait..." />
		</>
	);
};

export default StatutoryBenefitsSettings;
