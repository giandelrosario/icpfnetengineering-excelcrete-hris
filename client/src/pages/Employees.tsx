import api from '@/config/api';
import { useQuery } from '@tanstack/react-query';
import { Edit2, Eye, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

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
	const itemsPerPage = 10;

	const navigate = useNavigate();

	const employees_query = useQuery({
		queryKey: ['employees'],
		queryFn: async () => {
			const response = await api.get('/employee');
			return response.data;
		},
	});

	if (employees_query.isPending) {
		return (
			<main className="bg-slate-50 min-h-screen w-full">
				<div className="container mx-auto p-4">
					<div className="text-center py-12">
						<p className="text-slate-600 font-medium">Loading employees...</p>
					</div>
				</div>
			</main>
		);
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

	const filteredEmployees =
		employees_query.data?.filter((employee: TEmployee) => {
			if (!searchTerm) return true;
			const searchLower = searchTerm.toLowerCase();
			const fullName = `${employee.first_name} ${employee.middle_name || ''} ${employee.last_name}`.toLowerCase();
			return fullName.includes(searchLower) || employee.email?.toLowerCase().includes(searchLower) || false;
		}) || [];

	// Pagination calculations
	const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

	// Reset to page 1 when search changes
	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	};

	return (
		<main className="bg-white min-h-screen w-full">
			<div className="max-w-6xl mx-auto p-4 space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-medium text-slate-700">Employees</h2>
						<p className="text-sm text-slate-500">View and manage all employees</p>
					</div>
					<Link to="create" className="text-xs inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 font-medium transition hover:bg-slate-800">
						<Plus size={18} />
						Create Employee
					</Link>
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
										<th className="px-6 py-3 font-semibold text-slate-700">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200">
									{paginatedEmployees.map((employee: TEmployee, index: number) => (
										<tr key={employee.id || index} className="hover:bg-slate-50 transition">
											<td className="px-6 py-4">
												<p className="font-medium text-slate-900">
													{employee.first_name} {employee.middle_name ? `${employee.middle_name.charAt(0)}.` : ''} {employee.last_name}
												</p>
											</td>
											<td className="px-6 py-4 text-center">
												<span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700">
													{employee.sss_count || 0}
												</span>
											</td>
											<td className="px-6 py-4 text-center">
												<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
													{employee.philhealth_count || 0}
												</span>
											</td>
											<td className="px-6 py-4 text-center">
												<span className="inline-flex items-center gap-1 rounded-full  px-3 py-1.5 text-sm font-medium text-slate-700">
													{employee.pagibig_count || 0}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="flex gap-2">
													<button
														className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
														onClick={() => navigate(`${employee.id}`)}
													>
														<Eye size={14} />
													</button>
													<button className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">
														<Edit2 size={14} />
													</button>
													<button className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition">
														<Trash2 size={14} />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-6 py-4">
							<div className="text-sm text-slate-600">
								Showing {filteredEmployees.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
									disabled={currentPage === 1}
									className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
								>
									Previous
								</button>
								<div className="flex items-center gap-1">
									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
										<button
											key={page}
											onClick={() => setCurrentPage(page)}
											className={`rounded px-3 py-2 text-sm font-medium transition ${
												currentPage === page ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
											}`}
										>
											{page}
										</button>
									))}
								</div>
								<button
									onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
									disabled={currentPage === totalPages}
									className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
								>
									Next
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	);
};
export default Employees;
