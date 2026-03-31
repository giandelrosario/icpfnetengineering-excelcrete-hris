import Button from '@/components/Button';
import ConfirmationModal from '@/components/ConfirmationModal';
import EmployeeArchives from '@/components/EmployeeArchives';
import EmployeesSkeleton from '@/components/EmployeesSkeleton';
import api from '@/config/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, BookText, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

type TEmployee = {
	id?: number;
	first_name: string;
	middle_name?: string;
	last_name: string;
	email?: string;
	birth_date?: string;
	civil_status?: string;
	sss_count?: number;
	philhealth_count?: number;
	pagibig_count?: number;
	bir_count?: number;
};

const Employees = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [archivesOpen, setArchivesOpen] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; employeeId?: number; employeeName?: string }>({ isOpen: false });

	const itemsPerPage = 10;

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const employees_query = useQuery({
		queryKey: ['employees'],
		queryFn: async () => {
			const response = await api.get('/employee?status=ACTIVE');
			return response.data;
		},
	});

	const delete_employee_mutation = useMutation({
		mutationFn: async (employeeId: number) => {
			const response = await api.delete(`/employee/${employeeId}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employees'] });
			setDeleteConfirm({ isOpen: false });
		},
	});

	const filteredEmployees =
		employees_query.data?.filter((employee: TEmployee) => {
			if (!searchTerm) return true;
			const searchLower = searchTerm.toLowerCase();
			const fullName = `${employee.first_name} ${employee.middle_name || ''} ${employee.last_name}`.toLowerCase();
			return fullName.includes(searchLower) || employee.email?.toLowerCase().includes(searchLower) || false;
		}) || [];

	const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const paginatedEmployees = filteredEmployees.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);
	const pageStart = filteredEmployees.length ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0;
	const pageEnd = filteredEmployees.length ? Math.min(safeCurrentPage * itemsPerPage, filteredEmployees.length) : 0;

	// Pagination calculations
	// const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
	// const startIndex = (currentPage - 1) * itemsPerPage;
	// const endIndex = startIndex + itemsPerPage;
	// const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

	// Reset to page 1 when search changes
	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	};

	if (employees_query.isPending) {
		return <EmployeesSkeleton />;
	}

	if (employees_query.isError) {
		return (
			<main className="bg-slate-50 min-h-screen w-full">
				<div className="container mx-auto p-4">
					<div className="text-center py-12">
						<p className="text-red-600 font-medium">Error loading employees. Please try again later.</p>
					</div>
				</div>
			</main>
		);
	}

	return (
		<>
			<main className="bg-white min-h-screen w-full">
				<div className="max-w-6xl mx-auto p-4 space-y-4">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-lg font-medium text-slate-700">Employees</h2>
							<p className="text-sm text-slate-500">View and manage all employees</p>
						</div>
						<div className="flex items-center gap-2">
							<Button
								onClick={() => setArchivesOpen(true)}
								theme="outline"
								icon={{
									position: 'left',
									content: <Archive size={16} />,
								}}
							/>
							<Button
								onClick={() => navigate('create')}
								theme="default"
								text="Create Employee"
								icon={{
									position: 'left',
									content: <Plus size={18} color="#fff" />,
								}}
							/>
						</div>
					</div>

					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<input
							type="text"
							placeholder="Search by name..."
							value={searchTerm}
							onChange={(e) => handleSearch(e.target.value)}
							className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
						/>
					</div>

					{/* Table */}
					{filteredEmployees.length === 0 ? (
						<div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
							<Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />
							<p className="font-medium text-slate-700">No employees found</p>
							<p className="text-sm text-slate-500">{searchTerm ? 'Try adjusting your search' : 'Create your first employee to get started'}</p>
						</div>
					) : (
						<div className="space-y-4">
							<div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
								<table className="w-full text-left text-sm">
									<thead>
										<tr className="border-b border-slate-200 bg-slate-50">
											<th className="px-6 py-3 font-semibold text-slate-700">Name</th>
											<th className="px-6 py-3 font-semibold text-slate-700 text-center">SSS</th>
											<th className="px-6 py-3 font-semibold text-slate-700 text-center">PhilHealth</th>
											<th className="px-6 py-3 font-semibold text-slate-700 text-center">Pag-IBIG</th>
											<th className="px-6 py-3 font-semibold text-slate-700"></th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200">
										{paginatedEmployees.map((employee: TEmployee, index: number) => (
											<tr key={employee.id || index} className="hover:bg-slate-50 transition">
												<td className="px-6 py-2">
													<p className="font-medium text-slate-900">
														{employee.first_name} {employee.middle_name ? `${employee.middle_name.charAt(0)}.` : ''} {employee.last_name}
													</p>
												</td>
												<td className="px-6 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700">
														{employee.sss_count || 0}
													</span>
												</td>
												<td className="px-6 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
														{employee.philhealth_count || 0}
													</span>
												</td>
												<td className="px-6 py-2 text-center">
													<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
														{employee.pagibig_count || 0}
													</span>
												</td>
												<td className="px-6 py-2">
													<div className="flex gap-2">
														<button
															className="inline-flex items-center gap-1 rounded   px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
															onClick={() => navigate(`${employee.id}`)}
														>
															<BookText size={14} />
														</button>
														<button
															onClick={() => {
																setDeleteConfirm({
																	isOpen: true,
																	employeeId: employee.id,
																	employeeName: `${employee.first_name} ${employee.middle_name ? `${employee.middle_name.charAt(0)}.` : ''} ${employee.last_name}`,
																});
															}}
															className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
														>
															<Trash2 size={14} />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{filteredEmployees.length > 0 && (
									<div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-600">
										<span>
											Showing {pageStart} - {pageEnd} of {filteredEmployees.length}
										</span>
										<div className="flex items-center gap-2">
											<button
												disabled={safeCurrentPage === 1}
												onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
												className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 disabled:opacity-50"
											>
												Previous
											</button>
											<span className="text-xs text-slate-600">
												Page {safeCurrentPage} of {totalPages}
											</span>
											<button
												disabled={safeCurrentPage === totalPages}
												onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
												className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 disabled:opacity-50"
											>
												Next
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</main>

			<EmployeeArchives isOpen={archivesOpen} onClose={() => setArchivesOpen(false)} />

			<ConfirmationModal
				isOpen={deleteConfirm.isOpen}
				type="delete"
				title="Delete Employee"
				message={`Are you sure you want to delete ${deleteConfirm.employeeName}? This action cannot be undone.`}
				isLoading={delete_employee_mutation.isPending}
				onConfirm={() => {
					if (deleteConfirm.employeeId) {
						delete_employee_mutation.mutate(deleteConfirm.employeeId);
					}
				}}
				onCancel={() => setDeleteConfirm({ isOpen: false })}
			/>
		</>
	);
};
export default Employees;
