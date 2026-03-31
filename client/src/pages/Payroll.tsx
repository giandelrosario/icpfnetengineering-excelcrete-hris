import Button from '@/components/Button';
import api from '@/config/api';
import { useQuery } from '@tanstack/react-query';
import { set } from 'date-fns';
import { BookText, Calendar, Check, Search, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

type TEmployee = {
	id?: number;
	first_name: string;
	middle_name?: string;
	last_name: string;
	salary?: number;
	sss_settings?: TSSSSettings | null;
	philhealth_settings?: TPhilhealthSettings | null;
	pagibig_settings?: TPagIBIGSettings | null;
};

type TSSSSettings = {
	sss_no: string;
	total_contribution: number;
};

type TPagIBIGSettings = {
	pagibig_no: string;
	contribution: {
		employer_rate: 2;
		employee_rate: 2;
		total_rate: 4;
		total: 800;
	};
};

type TPhilhealthSettings = {
	philhealth_no: string | null;
	contribution: {
		total: number;
		rate: number;
	};
};

const MONTHS = [
	{ value: '01', label: 'January', short: 'Jan' },
	{ value: '02', label: 'February', short: 'Feb' },
	{ value: '03', label: 'March', short: 'Mar' },
	{ value: '04', label: 'April', short: 'Apr' },
	{ value: '05', label: 'May', short: 'May' },
	{ value: '06', label: 'June', short: 'Jun' },
	{ value: '07', label: 'July', short: 'Jul' },
	{ value: '08', label: 'August', short: 'Aug' },
	{ value: '09', label: 'September', short: 'Sep' },
	{ value: '10', label: 'October', short: 'Oct' },
	{ value: '11', label: 'November', short: 'Nov' },
	{ value: '12', label: 'December', short: 'Dec' },
];

const PAY_PERIODS = [
	{ value: 'half', label: 'Half' },
	{ value: 'full', label: 'Full' },
];

const BENEFITS = [
	{ value: 'sss', label: 'SSS' },
	{ value: 'philhealth', label: 'PhilHealth' },
	{ value: 'pagibig', label: 'Pag-IBIG' },
];

const Payroll = () => {
	const [searchTerm, setSearchTerm] = useState('');

	const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
	const [selectedPayPeriod, setSelectedPayPeriod] = useState<string | null>(null);
	const [selectedEmployee, setSelectedEmployee] = useState<TEmployee[]>([]);

	const [currentPage, setCurrentPage] = useState(1);
	const [openProceedModal, setOpenProceedModal] = useState(false);

	const [benefits, setBenefits] = useState<{ philhealth: boolean; sss: boolean; pagibig: boolean }>({ philhealth: false, sss: false, pagibig: false });

	const [step, setStep] = useState(1);

	const navigate = useNavigate();

	const itemsPerPage = 10;

	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Something went wrong. Please try again later.');

	const employees_query = useQuery({
		queryKey: ['employees', 'payroll'],
		queryFn: async () => {
			const response = await api.get('/employee/payroll?status=ACTIVE&sss=' + benefits.sss + '&philhealth=' + benefits.philhealth + '&pagibig=' + benefits.pagibig);
			return response.data as TEmployee[];
		},
		enabled: step === 2,
	});

	const toggleMonth = (value: string) => {
		setSelectedMonths((prev) => (prev.includes(value) ? prev.filter((month) => month !== value) : [...prev, value]));
	};

	const togglePayPeriod = (value: string) => {
		setSelectedPayPeriod((prev) => (prev === value ? null : value));
	};

	const toggleBenefit = (value: string) => {
		setBenefits((prev) => ({ ...prev, [value]: !prev[value as keyof typeof prev] }));
	};

	const selectAllBenefits = () => {
		setBenefits(BENEFITS.reduce((acc, benefit) => ({ ...acc, [benefit.value]: true }), {} as typeof benefits));
	};

	const selectAllEmployees = () => {
		const allEmployees = employees_query.data || [];
		if (allEmployees.length === 0) return;
		setSelectedEmployee((prev) => (prev.length === allEmployees.length ? [] : allEmployees));
	};

	const toggleEmployee = (id?: number) => {
		if (!id) return;

		const employee = employees_query.data?.find((emp) => emp.id === id);
		if (!employee) return;

		setSelectedEmployee((prev) => (prev.some((emp) => emp.id === id) ? prev.filter((emp) => emp.id !== id) : [...prev, employee]));
	};

	const selectedMonthValue = MONTHS.filter((month) => selectedMonths.includes(month.value)).map((month) => parseInt(month.value));

	const selectedMonthLabels = MONTHS.filter((month) => selectedMonths.includes(month.value)).map((month) => month.short);
	const selectedMonthNames = MONTHS.filter((month) => selectedMonths.includes(month.value)).map((month) => month.label);

	const selectedPayPeriodLabel = PAY_PERIODS.find((period) => period.value === selectedPayPeriod)?.label || 'None';
	const selectedBenefitLabels = BENEFITS.filter((benefit) => benefits[benefit.value as keyof typeof benefits]).map((benefit) => benefit.label);

	const confirmProceed = () => {
		console.log('Selected Benefits:', benefits);
		console.log('Selected Pay Period:', selectedPayPeriod);
		console.log('Selected Months:', selectedMonthValue);
		console.log('Selected Employees:', selectedEmployee);
	};

	return (
		<main className="bg-slate-50 min-h-screen w-full">
			<div className="max-w-6xl mx-auto p-4 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-medium text-slate-700">Payroll</h2>
						<p className="text-sm text-slate-500">Select employees and months for advance pay</p>
					</div>
				</div>

				{step === 1 && (
					<>
						{/* month selection */}
						<div className="w-full gap-4">
							<div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 lg:col-span-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Calendar size={18} className="text-slate-600" />
										<h3 className="text-sm font-semibold text-slate-800">Advance Pay Months</h3>
									</div>
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
									{MONTHS.map((month) => {
										const isSelected = selectedMonths.includes(month.value);
										return (
											<button
												key={month.value}
												className={`flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
													isSelected ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
												}`}
												onClick={() => toggleMonth(month.value)}
											>
												{isSelected && <Check size={14} />}
												{month.label}
											</button>
										);
									})}
								</div>
								<div className="text-xs text-slate-600">Selected months: {selectedMonthLabels.length ? selectedMonthLabels.join(', ') : 'None'}</div>
							</div>
						</div>

						{/* salary selection */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Calendar size={18} className="text-slate-600" />
										<h3 className="text-sm font-semibold text-slate-800">Salary Selection</h3>
									</div>
									<span className="text-xs text-slate-500">Choose full salary or half salary</span>
								</div>
								<div className="grid grid-cols-2 gap-2">
									{PAY_PERIODS.map((period) => {
										const isSelected = selectedPayPeriod === period.value;
										return (
											<button
												key={period.value}
												className={`flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
													isSelected ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
												}`}
												onClick={() => togglePayPeriod(period.value)}
											>
												{isSelected && <Check size={14} />}
												{period.label}
											</button>
										);
									})}
								</div>
								<div className="text-xs text-slate-600">Selected pay period: {selectedPayPeriodLabel}</div>
							</div>

							<div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Users size={18} className="text-slate-600" />
										<h3 className="text-sm font-semibold text-slate-800">Benefits Selection</h3>
									</div>
									<div className="flex items-center gap-2">
										<Button theme="outline" text="Select All" onClick={selectAllBenefits} />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-2">
									{BENEFITS.map((benefit) => {
										const isSelected = benefits[benefit.value as keyof typeof benefits];
										return (
											<button
												key={benefit.value}
												className={`flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
													isSelected ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
												}`}
												onClick={() => toggleBenefit(benefit.value)}
											>
												{isSelected && <Check size={14} />}
												{benefit.label}
											</button>
										);
									})}
								</div>
								<div className="text-xs text-slate-600">Selected benefits: {selectedBenefitLabels.length ? selectedBenefitLabels.join(', ') : 'None'}</div>
							</div>
						</div>
					</>
				)}

				{step === 2 && (
					<div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
						<div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
							<div>
								<h3 className="text-sm font-semibold text-slate-800">Select Employees</h3>
								<p className="text-xs text-slate-500">Chosen employees will share the same advance pay months</p>
							</div>
						</div>
						<div className="p-4 border-b border-slate-200">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
								<input
									type="text"
									placeholder="Search employees by name or email"
									value={searchTerm}
									className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
								/>
							</div>
						</div>

						{employees_query.isPending ? (
							<div className="p-6 text-sm text-slate-500">Loading employees...</div>
						) : employees_query.isError ? (
							<div className="p-6 text-sm text-red-600">Error loading employees. Please try again.</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm">
									<thead>
										<tr className="border-b border-slate-200 bg-slate-50">
											<th className="px-6 py-3 font-semibold text-slate-700">
												<input
													type="checkbox"
													checked={employees_query.data?.length ? selectedEmployee.length === employees_query.data.length : false}
													onChange={() => selectAllEmployees()}
													className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200"
												/>
											</th>
											<th className="px-6 py-3 font-semibold text-slate-700">Employee</th>
										</tr>
									</thead>
									<tbody>
										{employees_query.data?.length === 0 ? (
											<tr>
												<td colSpan={3} className="px-6 py-4 text-sm text-slate-500">
													No employees found. Please adjust your filters or add employees to the system.
												</td>
											</tr>
										) : (
											employees_query.data?.map((employee) => (
												<tr key={employee.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
													<td className="px-6 py-4">
														<input
															type="checkbox"
															checked={selectedEmployee.some((emp) => emp.id === employee.id)}
															onChange={() => toggleEmployee(employee.id)}
															className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200"
														/>
													</td>
													<td className="px-6 py-4">
														<div className="flex items-center gap-3">
															<div className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-sm font-medium text-white">
																{employee.first_name.charAt(0)}
																{employee.last_name.charAt(0)}
															</div>
															<div>
																<p className="text-sm font-medium text-slate-900">{employee.first_name + ' ' + employee.last_name}</p>
															</div>
														</div>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}

				<div className="w-full flex justify-end items-center gap-2">
					{step === 2 && <Button theme="default" text="Previous" onClick={() => setStep((prev) => prev - 1)} />}

					{step === 1 && <Button theme="default" text="Next" disabled={selectedMonths.length === 0 || !selectedPayPeriod} onClick={() => setStep((prev) => prev + 1)} />}

					{step === 2 && <Button theme="outline" text="Proceed" onClick={confirmProceed} />}
				</div>
			</div>

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
		</main>
	);
};

export default Payroll;
