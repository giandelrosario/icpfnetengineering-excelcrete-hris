import Button from '@/components/Button';
import useAxios from '@/hooks/useAxios';
import { FormatAsMoney } from '@/utils/lib';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Info, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type TBenefitSettings = {
	id: number;
	sss_share: number;
	philhealth_share: number;
	pagibig_share: number;
	created_at: string;
	updated_at: string;
};

type TSSSTableRow = {
	id?: number;
	salary_range_from: number;
	salary_range_to: number;
	msc_ss: number;
	msc_mpf: number;
	er_ss: number;
	er_mpf: number;
	er_ec: number;
	ee_ss: number;
	ee_mpf: number;
};

const SSS_EMPTY_ROW: TSSSTableRow = {
	salary_range_from: 0,
	salary_range_to: 0,
	msc_ss: 0,
	msc_mpf: 0,
	er_ss: 0,
	er_mpf: 0,
	er_ec: 0,
	ee_ss: 0,
	ee_mpf: 0,
};

const SSS_FIELDS: Array<{ key: keyof Omit<TSSSTableRow, 'id'>; label: string }> = [
	{ key: 'salary_range_from', label: 'Salary From' },
	{ key: 'salary_range_to', label: 'Salary To' },
	{ key: 'msc_ss', label: 'MSC SS' },
	{ key: 'msc_mpf', label: 'MSC MPF' },
	{ key: 'er_ss', label: 'ER SS' },
	{ key: 'er_mpf', label: 'ER MPF' },
	{ key: 'er_ec', label: 'ER EC' },
	{ key: 'ee_ss', label: 'EE SS' },
	{ key: 'ee_mpf', label: 'EE MPF' },
];

const toMoney = (value: number) => Number(value.toFixed(2));

const sssRowTotal = (row: TSSSTableRow) => toMoney(row.er_ss + row.er_mpf + row.er_ec + row.ee_ss + row.ee_mpf);

const BenefitSetting = () => {
	const api = useAxios();
	const queryClient = useQueryClient();

	const [philHealthInput, setPhilHealthInput] = useState(0);
	const [pagIBIGInput, setPagIBIGInput] = useState(0);
	const [sssRows, setSSSRows] = useState<TSSSTableRow[]>([]);

	const [openPhilHealthEditModal, setOpenPhilHealthEditModal] = useState(false);
	const [openPagIBIGEditModal, setOpenPagIBIGEditModal] = useState(false);
	const [openSSSEditModal, setOpenSSSEditModal] = useState(false);
	const [openSSSConfirmModal, setOpenSSSConfirmModal] = useState(false);

	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Something went wrong. Please try again later.');

	const settings_benefits_query = useQuery({
		queryKey: ['settings-benefits'],
		queryFn: async () => {
			const response = await api.get('/benefits');
			return response.data as TBenefitSettings;
		},
	});

	const sss_table_query = useQuery({
		queryKey: ['sss-table'],
		queryFn: async () => {
			const response = await api.get('/sss-table');
			return response.data as TSSSTableRow[];
		},
	});

	useEffect(() => {
		if (!sss_table_query.data) return;
		if (openSSSEditModal) return;
		setSSSRows(sss_table_query.data);
	}, [sss_table_query.data, openSSSEditModal]);

	const updateMutation = useMutation({
		mutationFn: async (data: Partial<TBenefitSettings>) => {
			const response = await api.put(`/benefits/${settings_benefits_query.data?.id}`, data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['settings-benefits'] });

			setOpenPhilHealthEditModal(false);
			setOpenPagIBIGEditModal(false);
		},
		onError: (error: any) => {
			alert('Error updating benefits settings: ' + error.message);
		},
	});

	const replaceSSSTableMutation = useMutation({
		mutationFn: async (rows: Omit<TSSSTableRow, 'id'>[]) => {
			const response = await api.put('/sss-table/replace-set', { rows });
			return response.data as { message: string; count: number };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['sss-table'] });
			setOpenSSSEditModal(false);
			setOpenSSSConfirmModal(false);
		},
		onError: (error: any) => {
			if (isAxiosError(error)) {
				const message = error.response?.data?.message || 'An error occurred while updating the SSS table. Please check your input and try again.';
				setErrorMessage(message);
				setShowErrorModal(true);
			}
		},
	});

	const handleSavePhilhealth = async () => {
		updateMutation.mutate({ philhealth_share: philHealthInput }); // Replace with actual value from input
	};
	const handleSavePagIbig = async () => {
		updateMutation.mutate({ pagibig_share: pagIBIGInput }); // Replace with actual value from input
	};

	const openSSSTableModal = () => {
		setSSSRows((sss_table_query.data || []).map((row) => ({ ...row })));

		setOpenSSSEditModal(true);
	};

	const updateSSSRowField = (rowIndex: number, field: keyof Omit<TSSSTableRow, 'id'>, value: string) => {
		const parsed = value.trim() === '' ? 0 : Number(value);

		setSSSRows((currentRows) =>
			currentRows.map((row, index) => {
				if (index !== rowIndex) return row;

				return {
					...row,
					[field]: Number.isFinite(parsed) ? parsed : 0,
				};
			}),
		);
	};

	const addSSSRow = () => {
		setSSSRows((currentRows) => {
			const lastRow = currentRows[currentRows.length - 1];
			const nextStart = lastRow ? toMoney(lastRow.salary_range_to + 0.01) : 0;

			return [
				...currentRows,
				{
					...SSS_EMPTY_ROW,
					salary_range_from: nextStart,
					salary_range_to: nextStart,
				},
			];
		});
	};

	const removeSSSRow = (rowIndex: number) => {
		setSSSRows((currentRows) => currentRows.filter((_, index) => index !== rowIndex));
	};

	const handleSaveSSSTable = () => {
		if (sssRows.length === 0) {
			setErrorMessage('The SSS table must contain at least one row.');
			setShowErrorModal(true);
			return;
		}

		const normalizedRows = sssRows
			.map(({ id: _id, ...row }) => ({
				...row,
				salary_range_from: toMoney(Number(row.salary_range_from || 0)),
				salary_range_to: toMoney(Number(row.salary_range_to || 0)),
				msc_ss: toMoney(Number(row.msc_ss || 0)),
				msc_mpf: toMoney(Number(row.msc_mpf || 0)),
				er_ss: toMoney(Number(row.er_ss || 0)),
				er_mpf: toMoney(Number(row.er_mpf || 0)),
				er_ec: toMoney(Number(row.er_ec || 0)),
				ee_ss: toMoney(Number(row.ee_ss || 0)),
				ee_mpf: toMoney(Number(row.ee_mpf || 0)),
			}))
			.sort((a, b) => a.salary_range_from - b.salary_range_from);

		for (let index = 0; index < normalizedRows.length; index += 1) {
			const row = normalizedRows[index];
			if (!row) continue;

			if (row.salary_range_from > row.salary_range_to) {
				setErrorMessage(`Row ${index + 1}: Salary From cannot be greater than Salary To.`);
				setShowErrorModal(true);
				return;
			}

			const previous = index > 0 ? normalizedRows[index - 1] : undefined;
			if (previous && row.salary_range_from <= previous.salary_range_to) {
				setErrorMessage(`Row ${index + 1}: Salary ranges cannot overlap.`);
				setShowErrorModal(true);
				return;
			}
		}

		replaceSSSTableMutation.mutate(normalizedRows);
	};

	if (settings_benefits_query.isPending || sss_table_query.isPending) {
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

	if (settings_benefits_query.isError || sss_table_query.isError) {
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
							<h1 className="text-lg font-medium text-slate-700">Benefit Settings</h1>
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
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
								onClick={() => {
									setPhilHealthInput(settings_benefits_query.data?.philhealth_share || 0);
									setOpenPhilHealthEditModal(true);
								}}
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
								onClick={() => {
									setPagIBIGInput(settings_benefits_query.data?.pagibig_share || 0);
									setOpenPagIBIGEditModal(true);
								}}
								className="w-full px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
							>
								Edit
							</button>
						</div>
					</div>

					{/* SSS Table */}
					<section className="space-y-4">
						<div className="w-full flex justify-between items-center gap-2">
							<div className="max-w-lg">
								<h2 className="text-lg font-medium text-slate-700">SSS Settings</h2>
								<p className="text-sm text-slate-500">
									Manage the SSS contribution table. This table is used to calculate employee and employer contributions based on salary ranges.
								</p>
							</div>
							<div>
								<Button text="Edit" theme="outline" onClick={openSSSTableModal} />
							</div>
						</div>
						<div className="space-y-4">
							<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
								<table className="w-full text-left text-sm">
									<thead>
										<tr className="border-b border-slate-200 bg-white">
											<th className="text-xs px-4 py-3 font-semibold text-slate-700">Range of Compensation</th>
											<th className="text-xs px-4 py-3 font-semibold text-slate-700 text-center">MSC SS</th>
											<th className="text-xs px-4 py-3 font-semibold text-slate-700 text-center">MSC MPF</th>
											<th className="text-xs px-4 py-3 font-semibold text-slate-700 text-center">Employer SS</th>
											<th className="text-xs px-4 py-3 font-semibold text-slate-700 text-center">Employer MPF</th>
											<th className="text-xs px-4 py-3 font-semibold text-slate-700 text-center">Employer EC</th>
											<th className="text-xs px-4 py-3 font-semibold text-slate-700 text-center">Employee SS</th>
											<th className="text-xs px-4 py-3 font-semibold text-slate-700 text-center">Employee MPF</th>
											<th className="text-xs px-4 py-3 font-semibold text-slate-700 text-center">Total</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200">
										{sss_table_query.data?.map((sss, index) => (
											<tr key={sss.id || index} className="hover:bg-slate-50 transition">
												<td className="px-4 py-2">
													<p className="font-medium text-slate-900">
														{FormatAsMoney(sss.salary_range_from || 0)} - {FormatAsMoney(sss.salary_range_to || 0)}
													</p>
												</td>
												<td className="px-4 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700">
														{FormatAsMoney(sss.msc_ss || 0)}
													</span>
												</td>
												<td className="px-4 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
														{FormatAsMoney(sss.msc_mpf || 0)}
													</span>
												</td>
												<td className="px-4 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
														{FormatAsMoney(sss.er_ss || 0)}
													</span>
												</td>
												<td className="px-4 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
														{FormatAsMoney(sss.er_mpf || 0)}
													</span>
												</td>
												<td className="px-4 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
														{FormatAsMoney(sss.er_ec || 0)}
													</span>
												</td>
												<td className="px-4 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
														{FormatAsMoney(sss.ee_ss || 0)}
													</span>
												</td>
												<td className="px-4 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
														{FormatAsMoney(sss.ee_mpf || 0)}
													</span>
												</td>
												<td className="px-4 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
														{FormatAsMoney(sssRowTotal(sss))}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</section>
				</div>
			</main>

			{openSSSEditModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-lg w-full overflow-hidden flex flex-col" style={{ maxWidth: 1200, maxHeight: '90vh' }}>
						<div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
							<div>
								<h2 className="text-lg font-semibold text-slate-900">Edit Entire SSS Table</h2>
								<p className="text-sm text-slate-500">Update all rows, then save to replace the current table set.</p>
							</div>
							<button onClick={addSSSRow} className="px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100">
								Add Row
							</button>
						</div>

						<div className="px-6 py-4 overflow-auto">
							<table className="w-full text-left text-sm" style={{ minWidth: 1250 }}>
								<thead>
									<tr className="border-b border-slate-200 bg-white sticky top-0">
										<th className="text-xs px-2 py-3 font-semibold text-slate-700">#</th>
										{SSS_FIELDS.map((field) => (
											<th key={field.key} className="text-xs px-2 py-3 font-semibold text-slate-700 text-center whitespace-nowrap">
												{field.label}
											</th>
										))}
										<th className="text-xs px-2 py-3 font-semibold text-slate-700 text-center">Total</th>
										<th className="text-xs px-2 py-3 font-semibold text-slate-700 text-center">Action</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200">
									{sssRows.map((row, rowIndex) => (
										<tr key={row.id || rowIndex} className="hover:bg-slate-50 transition">
											<td className="px-2 py-2 text-sm text-slate-700">{rowIndex + 1}</td>
											{SSS_FIELDS.map((field) => (
												<td key={field.key} className="px-2 py-2 text-center">
													<input
														type="number"
														step="0.01"
														value={row[field.key]}
														onChange={(event) => updateSSSRowField(rowIndex, field.key, event.target.value)}
														className="w-28 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
													/>
												</td>
											))}
											<td className="px-2 py-2 text-center text-slate-800 font-medium">{FormatAsMoney(sssRowTotal(row))}</td>
											<td className="px-2 py-2 text-center">
												<button
													onClick={() => removeSSSRow(rowIndex)}
													className="px-2 py-1 text-xs text-rose-600 border border-rose-200 rounded hover:bg-rose-50"
												>
													Remove
												</button>
											</td>
										</tr>
									))}

									{sssRows.length === 0 ? (
										<tr>
											<td colSpan={12} className="px-4 py-6 text-center text-slate-500">
												No rows to edit. Add a row to start a new table set.
											</td>
										</tr>
									) : null}
								</tbody>
							</table>
						</div>

						<div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
							<button
								onClick={() => {
									setOpenSSSEditModal(false);
								}}
								disabled={replaceSSSTableMutation.isPending}
								className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={() => setOpenSSSConfirmModal(true)}
								disabled={replaceSSSTableMutation.isPending}
								className="px-4 py-2 text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
							>
								Save Table Set
							</button>
						</div>
					</div>
				</div>
			)}
			{openSSSConfirmModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 w-96">
						<h2 className="text-lg font-semibold text-slate-900 mb-4">Confirm Replace SSS Table</h2>
						<p className="text-sm text-slate-700">This will delete the current SSS table and replace it with the edited rows. Are you sure you want to continue?</p>
						<div className="flex gap-3 mt-6">
							<button
								disabled={replaceSSSTableMutation.isPending}
								onClick={() => setOpenSSSConfirmModal(false)}
								className="text-sm flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium transition"
							>
								Cancel
							</button>
							<button
								disabled={replaceSSSTableMutation.isPending}
								onClick={handleSaveSSSTable}
								className="text-sm flex-1 px-4 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-medium transition"
							>
								{replaceSSSTableMutation.isPending ? 'Saving...' : 'Save Table Set'}
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
									defaultValue={settings_benefits_query.data?.pagibig_share || 0}
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
		</>
	);
};

export default BenefitSetting;
