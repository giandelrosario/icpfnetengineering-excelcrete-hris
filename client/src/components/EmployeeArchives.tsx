import api from '@/config/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AlertCircle, Archive, X } from 'lucide-react';

type TEmployee = {
	id?: number;
	first_name: string;
	middle_name?: string;
	last_name: string;
	email?: string;
	birth_date?: string;
	civil_status?: string;
};

interface EmployeeArchivesProps {
	isOpen: boolean;
	onClose: () => void;
}

const EmployeeArchives = ({ isOpen, onClose }: EmployeeArchivesProps) => {
	const queryClient = useQueryClient();

	const employee_archives_query = useQuery({
		queryKey: ['employees_archives'],
		queryFn: async () => {
			const response = await api.get('/employee?status=ARCHIVED');
			return response.data;
		},
		enabled: isOpen,
	});

	const activate_mutation = useMutation({
		mutationFn: async (employee_id: number) => {
			const response = await api.put(`/employee/${employee_id}?type=activate`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employees_archives'] });
			queryClient.invalidateQueries({ queryKey: ['employees'] });
			onClose();
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				const message = error.response?.data?.message || 'An error occurred while activating the employee.';
				alert(message);
				return;
			}
		},
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
				{/* Header */}
				<div className="flex items-center justify-between bg-white px-6 py-4 border-b border-slate-200">
					<div className="flex items-center gap-2">
						<Archive className="w-5 h-5 text-slate-600" />
						<h2 className="text-lg font-semibold text-slate-900">Archived Employees</h2>
					</div>
					<button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition" aria-label="Close modal">
						<X size={20} className="text-slate-600" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-auto">
					{employee_archives_query.isPending ? (
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
								<p className="text-slate-600 font-medium">Loading archived employees...</p>
							</div>
						</div>
					) : employee_archives_query.isError ? (
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
								<p className="text-red-600 font-medium">Error loading archived employees</p>
								<p className="text-sm text-slate-600 mt-1">Please try again later</p>
							</div>
						</div>
					) : employee_archives_query.data?.length === 0 ? (
						<div className="flex items-center justify-center h-64">
							<div className="text-center">
								<Archive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
								<p className="text-slate-700 font-medium">No archived employees</p>
								<p className="text-sm text-slate-600 mt-1">Archived employees will appear here</p>
							</div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead>
									<tr className="border-b border-slate-200 bg-slate-50 sticky top-0">
										<th className="px-6 py-3 font-semibold text-slate-700">Name</th>
										<th className="px-6 py-3 font-semibold text-slate-700">Civil Status</th>
										<th className="px-6 py-3 font-semibold text-slate-700">Birth Date</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200">
									{employee_archives_query.data?.map((employee: TEmployee) => (
										<tr key={employee.id} className="hover:bg-slate-50 transition">
											<td className="px-6 py-3">
												<p className="font-medium text-slate-900">
													{employee.first_name} {employee.middle_name ? `${employee.middle_name.charAt(0)}.` : ''} {employee.last_name}
												</p>
											</td>

											<td className="px-6 py-3">
												<p className="text-slate-600">{employee.civil_status || 'N/A'}</p>
											</td>
											<td className="px-6 py-3">
												<p className="text-slate-600">{employee.birth_date ? new Date(employee.birth_date).toLocaleDateString() : 'N/A'}</p>
											</td>
											<td className="px-6 py-3">
												<button
													onClick={() => activate_mutation.mutate(employee.id!)}
													className="text-xs px-3 py-1.5 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition"
												>
													Activate
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
					<button onClick={onClose} className="text-sm px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition">
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default EmployeeArchives;
