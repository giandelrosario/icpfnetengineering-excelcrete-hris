import Button from '@/components/Button';
import ConfirmationModal from '@/components/ConfirmationModal';
import EmployeeSkeleton from '@/components/EmployeeSkeleton';
import LoadingModal from '@/components/LoadingModal';
import api from '@/config/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { format } from 'date-fns';
import { Archive, ArrowLeft, Calendar, Church, Contact, FileText, History, Mail, MapPin, Pen, Phone, Plus, SquarePen, Trash, User, Users, X, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

type TEmployeeRelative = {
	id: number;
	employee_id?: number;
	first_name: string;
	middle_name: string;
	last_name: string;
	relationship: string;
	contact_no: string;
	address: string;
	occupation: string;
	birth_date: string;
	birth_place: string;
	updated_at: string;
	created_at: string;
};

type TSalaryHistory = {
	id: number;
	employee_id?: number;
	amount: number;
	updated_at: string;
	created_at: string;
};

type TSSSSettings = {
	id: number;
	employee_id?: number;
	sss_no: string;
	salary_range: [number, number];
	msc: {
		ss: number;
		mpf: number;
	};
	employer: {
		mpf: number;
		ec: number;
	};
	employee: {
		mpf: number;
	};
	total_contribution: number;
	updated_at: string;
	created_at: string;
};
type TPhilhealthSettings = {
	id: number;
	employee_id?: number;
	philhealth_no: string;
	total_contribution: number;
	contribution: {
		total: number;
		rate: number;
	};
	updated_at: string;
	created_at: string;
};
type TPagIBIGSettings = {
	id: number;
	employee_id?: number;
	pagibig_no: string;
	contribution: {
		employer_rate: number;
		employee_rate: number;
		total_rate: number;
		total: number;
	};
	updated_at: string;
	created_at: string;
};
type TBIRSettings = {
	id: number;
	employee_id?: number;
	tin_no: string;
	ee_share_rate: number;
	updated_at: string;
	created_at: string;
};

type TEmployee = {
	id: number;
	first_name: string;
	middle_name: string;
	last_name: string;
	email: string;
	contact_no: string;
	birth_place: string;
	birth_date: string;
	religion: string;
	citizenship: string;
	civil_status: string;
	updated_at: string;
	created_at: string;
	relatives: TEmployeeRelative[];
	salary_history: TSalaryHistory[];
	sss_settings?: TSSSSettings;
	philhealth_settings?: TPhilhealthSettings;
	pagibig_settings?: TPagIBIGSettings;
	bir_settings?: TBIRSettings;
};

const Employee = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const [openPersonalInfoModal, setOpenPersonalInfoModal] = useState(false);
	const [openContactInfoModal, setOpenContactInfoModal] = useState(false);
	const [openRelativesModal, setOpenRelativesModal] = useState(false);
	const [openSalaryModal, setOpenSalaryModal] = useState(false);
	const [formData, setFormData] = useState({
		first_name: '',
		middle_name: '',
		last_name: '',
		civil_status: '',
		birth_date: '',
		birth_place: '',
		citizenship: '',
		religion: '',
	});
	const [contactFormData, setContactFormData] = useState({
		email: '',
		contact_no: '',
	});
	const [salaryFormData, setSalaryFormData] = useState<TSalaryHistory[]>([]);
	const [newSalaryAmount, setNewSalaryAmount] = useState(0);
	const [relativesFormData, setRelativesFormData] = useState<TEmployeeRelative[]>([]);

	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Something went wrong. Please try again later.');

	const [openSSSModal, setOpenSSSModal] = useState(false);
	const [openPhilHealthModal, setOpenPhilHealthModal] = useState(false);
	const [openPagIBIGModal, setOpenPagIBIGModal] = useState(false);
	const [openBIRModal, setOpenBIRModal] = useState(false);

	const [openEditSSSModal, setOpenEditSSSModal] = useState(false);
	const [openEditPhilHealthModal, setOpenEditPhilHealthModal] = useState(false);
	const [openEditPagIBIGModal, setOpenEditPagIBIGModal] = useState(false);
	const [openEditBIRModal, setOpenEditBIRModal] = useState(false);

	const sssEditNoInputRef = useRef<HTMLInputElement>(null);

	const philHealthNoEditInputRef = useRef<HTMLInputElement>(null);

	const pagibigNoEditInputRef = useRef<HTMLInputElement>(null);
	const pagibigRateInputRef = useRef<HTMLInputElement>(null);

	const tinEditInputRef = useRef<HTMLInputElement>(null);

	const [philhealthSettings, setPhilhealthSettings] = useState({ philhealth_no: '' });
	const [pagibigSettings, setPagIBIGSettings] = useState({ pagibig_no: '', ee_share_rate: 2 });
	const [sssSettings, setSSSSettings] = useState({ sss_no: '', ee_share_rate: 5, mpf_amount: 0 });
	const [birSettings, setBIRSettings] = useState({ tin_no: '' });

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showArchiveModal, setShowArchiveModal] = useState(false);

	const benefits_query = useQuery({
		queryKey: ['benefits'],
		queryFn: async () => {
			const response = await api.get('/benefits');
			return response.data;
		},
		enabled: !!id,
	});

	const employee_query = useQuery({
		queryKey: ['employee', id],
		queryFn: async () => {
			const response = await api.get(`/employee/${id}`);
			return response.data;
		},
		enabled: !!id,
	});

	const edit_personal_info_mutation = useMutation({
		mutationFn: async (payload: Partial<TEmployee>) => {
			const response = await api.put(`/employee/${id}?type=personal_info`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenPersonalInfoModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while updating personal information.');
				setShowErrorModal(true);
			}
		},
	});

	const edit_contact_info_mutation = useMutation({
		mutationFn: async (payload: Partial<TEmployee>) => {
			const response = await api.put(`/employee/${id}?type=contact_info`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenContactInfoModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while updating contact information.');
				setShowErrorModal(true);
			}
		},
	});

	const edit_relatives_mutation = useMutation({
		mutationFn: async (payload: TEmployeeRelative[]) => {
			const response = await api.put(`/employee/${id}?type=relatives`, { relatives: payload });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenRelativesModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while updating relatives.');
				setShowErrorModal(true);
			}
		},
	});

	const edit_salary_mutation = useMutation({
		mutationFn: async (amount: number) => {
			const response = await api.put(`/employee/${id}?type=salary`, { salary: { amount: amount } });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenSalaryModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while updating salary information.');
				setShowErrorModal(true);
			}
		},
	});

	const add_pagibig_mutation = useMutation({
		mutationFn: async (payload: Partial<TPagIBIGSettings>) => {
			const response = await api.post(`/employee/${id}/pagibig`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenPagIBIGModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while adding Pag-IBIG settings.');
				setShowErrorModal(true);
				setOpenPagIBIGModal(false);
			}
		},
	});

	const add_sss_mutation = useMutation({
		mutationFn: async (payload: Partial<TSSSSettings>) => {
			const response = await api.post(`/employee/${id}/sss`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenSSSModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while adding SSS settings.');
				setShowErrorModal(true);
				setOpenSSSModal(false);
			}
		},
	});

	const add_philhealth_mutation = useMutation({
		mutationFn: async (payload: Partial<TPhilhealthSettings>) => {
			const response = await api.post(`/employee/${id}/philhealth`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenPhilHealthModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while adding PhilHealth settings.');
				setShowErrorModal(true);
				setOpenPhilHealthModal(false);
			}
		},
	});

	const add_bir_mutation = useMutation({
		mutationFn: async (payload: Partial<TBIRSettings>) => {
			const response = await api.post(`/employee/${id}/bir`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenBIRModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while adding BIR settings.');
				setShowErrorModal(true);
				setOpenBIRModal(false);
			}
		},
	});

	const edit_sss_mutation = useMutation({
		mutationFn: async (payload: Partial<TSSSSettings>) => {
			const response = await api.put(`/employee/${id}?type=sss_settings`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenEditSSSModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while updating SSS settings.');
				setShowErrorModal(true);
				setOpenEditSSSModal(false);
			}
		},
	});

	const edit_philhealth_mutation = useMutation({
		mutationFn: async (payload: Partial<TPhilhealthSettings>) => {
			const response = await api.put(`/employee/${id}?type=philhealth_settings`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenEditPhilHealthModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while updating PhilHealth settings.');
				setShowErrorModal(true);
				setOpenEditPhilHealthModal(false);
			}
		},
	});

	const edit_pagibig_mutation = useMutation({
		mutationFn: async (payload: Partial<TPagIBIGSettings>) => {
			const response = await api.put(`/employee/${id}?type=pagibig_settings`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenEditPagIBIGModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while updating Pag-IBIG settings.');
				setShowErrorModal(true);
				setOpenEditPagIBIGModal(false);
			}
		},
	});

	const edit_bir_mutation = useMutation({
		mutationFn: async (payload: Partial<TBIRSettings>) => {
			const response = await api.put(`/employee/${id}?type=bir_settings`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setOpenEditBIRModal(false);
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while updating BIR settings.');
				setShowErrorModal(true);
				setOpenEditBIRModal(false);
			}
		},
	});

	const archive_employee_mutation = useMutation({
		mutationFn: async () => {
			const response = await api.put(`/employee/${id}?type=archive`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['employee', id] });
			setShowArchiveModal(false);
			navigate('../');
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while archiving the employee.');
				setShowErrorModal(true);
				setShowArchiveModal(false);
			}
		},
	});

	const delete_employee_mutation = useMutation({
		mutationFn: async () => {
			const response = await api.delete(`/employee/${id}`);
			return response.data;
		},
		onSuccess: () => {
			setShowDeleteModal(false);
			navigate('../');
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message || 'An error occurred while deleting the employee.');
				setShowErrorModal(true);
				setShowDeleteModal(false);
			}
		},
	});

	const employee: TEmployee = employee_query.data;

	const formatDate = (value?: string) => {
		if (!value) return 'N/A';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return 'N/A';
		return format(date, 'MMMM d, yyyy');
	};

	const calculateAge = (birthDate?: string) => {
		if (!birthDate) return 'N/A';
		const today = new Date();
		const birth = new Date(birthDate);
		if (Number.isNaN(birth.getTime())) return 'N/A';
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age;
	};

	const handleOpenModal = () => {
		setFormData({
			first_name: employee.first_name,
			middle_name: employee.middle_name,
			last_name: employee.last_name,
			civil_status: employee.civil_status,
			birth_date: employee.birth_date.split('T')[0],
			birth_place: employee.birth_place,
			citizenship: employee.citizenship,
			religion: employee.religion,
		});
		setOpenPersonalInfoModal(true);
	};

	const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSavePersonalInfo = () => {
		edit_personal_info_mutation.mutate(formData);
		setOpenPersonalInfoModal(false);
	};

	const handleOpenContactModal = () => {
		setContactFormData({
			email: employee?.email || '',
			contact_no: employee?.contact_no || '',
		});
		setOpenContactInfoModal(true);
	};

	const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setContactFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSaveContactInfo = () => {
		edit_contact_info_mutation.mutate(contactFormData);
	};

	const handleOpenRelativesModal = () => {
		setRelativesFormData(employee.relatives || []);
		setOpenRelativesModal(true);
	};

	const handleRelativeChange = (index: number, field: string, value: string) => {
		const updated = [...relativesFormData];
		updated[index] = {
			...updated[index],
			[field]: value,
		};
		setRelativesFormData(updated);
	};

	const handleAddRelative = () => {
		const newRelative: TEmployeeRelative = {
			id: 0,
			employee_id: employee?.id,
			first_name: '',
			middle_name: '',
			last_name: '',
			relationship: '',
			contact_no: '',
			occupation: '',
			birth_date: '',
			birth_place: '',
			address: '',
			updated_at: new Date().toISOString(),
			created_at: new Date().toISOString(),
		};
		setRelativesFormData([...relativesFormData, newRelative]);
	};

	const handleRemoveRelative = (index: number) => {
		const updated = relativesFormData.filter((_, i) => i !== index);
		setRelativesFormData(updated);
	};

	const handleOpenSalaryModal = () => {
		setSalaryFormData(employee?.salary_history || []);
		setNewSalaryAmount(0);
		setOpenSalaryModal(true);
	};

	const handleAddSalaryEntry = () => {
		if (!newSalaryAmount || newSalaryAmount <= 0) {
			setErrorMessage('Please enter a valid salary amount');
			setShowErrorModal(true);
			return;
		}

		const newSalary: TSalaryHistory = {
			id: 0,
			employee_id: employee?.id,
			amount: newSalaryAmount,
			updated_at: new Date().toISOString(),
			created_at: new Date().toISOString(),
		};
		setSalaryFormData([...salaryFormData, newSalary]);
	};

	const handleSaveSalaryHistory = () => {
		edit_salary_mutation.mutate(newSalaryAmount);
	};

	const getCurrentSalary = (): number => {
		if (!employee?.salary_history || employee?.salary_history.length === 0) return 0;
		return employee?.salary_history[employee?.salary_history.length - 1].amount;
	};

	const handlePagIBIGChange = (field: keyof TPagIBIGSettings, value: string) => {
		setPagIBIGSettings((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSSSChange = (field: keyof TSSSSettings, value: string) => {
		setSSSSettings((prev) => ({
			...prev,
			[field]: ['ee_share_rate', 'mpf_amount'].includes(field) ? parseFloat(value) : value,
		}));
	};

	const handlePhilhealthChange = (field: keyof TPhilhealthSettings, value: string) => {
		setPhilhealthSettings((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleBIRChange = (field: keyof TBIRSettings, value: string) => {
		setBIRSettings((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handlePagIBIGSave = () => {
		if (!pagibigSettings.pagibig_no || pagibigSettings.ee_share_rate <= 0) {
			setErrorMessage('Please fill in all required fields for Pag-IBIG settings.');
			setShowErrorModal(true);
			return;
		}
		add_pagibig_mutation.mutate(pagibigSettings);
	};

	const handleSSSSave = () => {
		if (!sssSettings.sss_no || sssSettings.ee_share_rate <= 0 || sssSettings.mpf_amount < 0) {
			setErrorMessage('Please fill in all required fields for SSS settings.');
			setShowErrorModal(true);
		}
		add_sss_mutation.mutate(sssSettings);
	};

	const handlePhilHealthSave = () => {
		if (!philhealthSettings.philhealth_no) {
			setErrorMessage('Please fill in all required fields for PhilHealth settings.');
			setShowErrorModal(true);
			return;
		}
		add_philhealth_mutation.mutate(philhealthSettings);
	};

	const handleBIRSave = () => {
		if (!birSettings.tin_no) {
			setErrorMessage('Please fill in all required fields for BIR settings.');
			setShowErrorModal(true);
			return;
		}
		add_bir_mutation.mutate(birSettings);
	};
	const handleEditPagIBIGSave = () => {
		if (!pagibigNoEditInputRef.current?.value || !pagibigRateInputRef.current || parseFloat(pagibigRateInputRef.current?.value) <= 0) {
			setErrorMessage('Please fill in all required fields for Pag-IBIG settings.');
			setShowErrorModal(true);
			return;
		}
		edit_pagibig_mutation.mutate({
			pagibig_no: pagibigNoEditInputRef.current?.value || '',
		});
	};

	const handleEditSSSSave = () => {
		if (!sssEditNoInputRef.current?.value) {
			setErrorMessage('Please fill in all required fields for SSS settings.');
			setShowErrorModal(true);
			return;
		}
		edit_sss_mutation.mutate({
			sss_no: sssEditNoInputRef.current?.value || '',
		});
	};

	const handleEditPhilHealthSave = () => {
		if (!philHealthNoEditInputRef.current?.value) {
			setErrorMessage('Please fill in all required fields for PhilHealth settings.');
			setShowErrorModal(true);
			return;
		}
		edit_philhealth_mutation.mutate({
			philhealth_no: philHealthNoEditInputRef.current?.value || '',
		});
	};

	const handleEditBIRSave = () => {
		if (!tinEditInputRef.current?.value) {
			setErrorMessage('Please fill in all required fields for BIR settings.');
			setShowErrorModal(true);
			return;
		}
		edit_bir_mutation.mutate({
			tin_no: tinEditInputRef.current?.value || '',
		});
	};

	if (employee_query.isPending || benefits_query.isPending) {
		return <EmployeeSkeleton />;
	}

	if (employee_query.isError) {
		return (
			<main className="bg-slate-50 min-h-screen w-full">
				<div className="container mx-auto p-4">
					<div className="bg-red-50 border border-red-200 rounded-lg p-6">
						<p className="text-red-800 font-medium">Error loading employee details. Please try again later.</p>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="bg-white min-h-screen w-full pb-12">
			<div className="container mx-auto px-4 py-8">
				<div>
					<button onClick={() => navigate(-1)} className="rounded-full bg-white p-2 border border-slate-200 hover:bg-slate-50">
						<ArrowLeft size={20} className="text-slate-600 hover:text-slate-900 transition-colors" />
					</button>
				</div>
				{/* Personal Information Section */}
				<section className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6 mt-5">
					<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
						<div className="flex items-center gap-2">
							<User className="w-5 h-5 text-slate-600" />
							<h2 className="text-md font-semibold text-slate-900">Personal Information</h2>
						</div>

						<Button
							text="Edit"
							icon={{
								position: 'left',
								content: <Pen size={14} />,
							}}
							theme="outline"
							onClick={handleOpenModal}
						/>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
								<User className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold text-slate-500 uppercase">Name</p>
									<p className="text-sm font-medium text-slate-900 mt-1 wrap-break-word">
										{employee?.first_name} {employee?.middle_name} {employee?.last_name}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
								<User className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold text-slate-500 uppercase">Civil Status</p>
									<p className="text-sm font-medium text-slate-900 mt-1 wrap-break-word">{employee?.civil_status}</p>
								</div>
							</div>

							<div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
								<Calendar className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold text-slate-500 uppercase">Birth Date</p>
									<p className="text-sm font-medium text-slate-900 mt-1 wrap-break-word">{formatDate(employee?.birth_date)}</p>
									<p className="text-xs font-medium text-slate-500 mt-1">Age : {calculateAge(employee?.birth_date)} years</p>
								</div>
							</div>
							<div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
								<MapPin className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Birth Place</p>
									<p className="text-sm font-medium text-slate-900 mt-1 wrap-break-word">{employee?.birth_place}</p>
								</div>
							</div>
							<div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
								<Contact className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Citizenship</p>
									<p className="text-sm font-medium text-slate-900 mt-1 wrap-break-word">{employee?.citizenship}</p>
								</div>
							</div>
							<div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
								<Church className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Religion</p>
									<p className="text-sm font-medium text-slate-900 mt-1 wrap-break-word">{employee?.religion}</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Contact Information Section */}
				<section className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
					<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
						<div className="flex items-center gap-2">
							<Mail className="w-5 h-5 text-slate-600" />
							<h2 className="text-md font-semibold text-slate-900">Contact Information</h2>
						</div>

						<Button
							text="Edit"
							icon={{
								position: 'left',
								content: <Pen size={14} />,
							}}
							theme="outline"
							onClick={handleOpenContactModal}
						/>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
								<Mail className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
									<p className="text-sm font-medium text-slate-900 mt-1 wrap-break-word">{employee?.email || 'N/A'}</p>
								</div>
							</div>
							<div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
								<Phone className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
								<div className="flex-1 min-w-0">
									<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone Number</p>
									<p className="text-sm font-medium text-slate-900 mt-1 wrap-break-word">{employee?.contact_no || 'N/A'}</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Salary History Section */}

				<section className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
					<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
						<div className="flex items-center gap-2">
							<span className="font-extrabold text-slate-600">PHP</span>
							<h2 className="text-md font-semibold text-slate-900">Current Salary</h2>
						</div>
						<Button
							text="View History"
							icon={{
								position: 'left',
								content: <History size={14} />,
							}}
							theme="outline"
							onClick={handleOpenSalaryModal}
						/>
					</div>

					<div className="p-6">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium text-slate-600">Latest Salary Entry</p>
							<p className="text-xl font-bold text-slate-900">₱{getCurrentSalary().toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
						</div>
					</div>
				</section>

				{/* Family Members Section */}
				{employee?.relatives && employee?.relatives.length > 0 && (
					<div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
						<div className="flex justify-between items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
							<div className="flex items-center gap-2">
								<Users className="w-5 h-5 text-slate-600" />
								<h2 className="text-md font-semibold text-slate-900">Family Members</h2>
							</div>
							<div>
								<Button
									text="Edit"
									icon={{
										position: 'left',
										content: <Pen size={14} />,
									}}
									theme="outline"
									onClick={handleOpenRelativesModal}
								/>
							</div>
						</div>
						<div className="p-6">
							<div className="space-y-4">
								{employee?.relatives.map((relative) => (
									<div key={relative.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
										<div className="flex items-start justify-between mb-4">
											<div>
												<h4 className="font-semibold text-slate-900">
													{relative.first_name} {relative.middle_name} {relative.last_name}
												</h4>
												<p className="text-sm text-slate-600 font-medium">{relative.relationship}</p>
											</div>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
											<div>
												<p className="text-xs text-slate-500 font-semibold uppercase">Occupation</p>
												<p className="text-slate-900 font-medium mt-1">{relative.occupation || 'N/A'}</p>
											</div>
											<div>
												<p className="text-xs text-slate-500 font-semibold uppercase">Contact</p>
												<p className="text-slate-900 font-medium mt-1">{relative.contact_no || 'N/A'}</p>
											</div>
											<div>
												<p className="text-xs text-slate-500 font-semibold uppercase">Birth Date</p>
												<p className="text-slate-900 font-medium mt-1">{formatDate(relative?.birth_date)}</p>
											</div>
											<div>
												<p className="text-xs text-slate-500 font-semibold uppercase">Birth Place</p>
												<p className="text-slate-900 font-medium mt-1">{relative.birth_place}</p>
											</div>
											<div className="col-span-1 sm:col-span-2">
												<p className="text-xs text-slate-500 font-semibold uppercase">Address</p>
												<p className="text-slate-900 font-medium mt-1">{relative.address}</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Statutory Deductions & Settings Section */}
				<section className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
					<div className="flex items-center gap-2 bg-white px-6 py-4 border-b border-slate-200">
						<FileText className="w-5 h-5 text-slate-600" />
						<h2 className="text-md font-semibold text-slate-900">Statutory Deductions & Benefits</h2>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* SSS */}
							{employee?.sss_settings ? (
								<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold text-slate-900">SSS</h3>
										<button onClick={() => setOpenEditSSSModal(true)}>
											<SquarePen size={16} className=" text-slate-600" />
										</button>
									</div>
									<div className="space-y-3">
										<div>
											<p className="text-xs text-slate-600 uppercase font-semibold">SSS Number</p>
											<p className="text-sm font-medium text-slate-900 mt-1">{employee?.sss_settings.sss_no || 'N/A'}</p>
										</div>
										<div>
											<p className="text-xs text-slate-600 uppercase font-semibold">Contribution</p>
											<p className="text-sm font-medium text-slate-900 mt-1">PHP {employee?.sss_settings?.total_contribution}</p>
										</div>
									</div>
								</div>
							) : (
								<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">SSS</h3>
									<p className="text-sm font-medium text-slate-900 mt-1">No SSS settings found for this employee.</p>
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
							{employee?.philhealth_settings ? (
								<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold text-slate-900">PhilHealth</h3>
										<button onClick={() => setOpenEditPhilHealthModal(true)}>
											<SquarePen size={16} className=" text-slate-600" />
										</button>
									</div>
									<div className="space-y-3">
										<div>
											<p className="text-xs text-slate-600 uppercase font-semibold">PhilHealth Number</p>
											<p className="text-sm font-medium text-slate-900 mt-1">{employee?.philhealth_settings.philhealth_no || 'N/A'}</p>
										</div>
										<div>
											<p className="text-xs text-slate-600 uppercase font-semibold">Rate</p>
											<p className="text-sm font-medium text-slate-900 mt-1">{employee?.philhealth_settings.contribution?.rate}%</p>
										</div>
										<div>
											<p className="text-xs text-slate-600 uppercase font-semibold">Contribution</p>
											<p className="text-sm font-medium text-slate-900 mt-1">PHP {employee?.philhealth_settings.contribution?.total}</p>
										</div>
									</div>
								</div>
							) : (
								<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">PhilHealth</h3>
									<p className="text-sm font-medium text-slate-900 mt-1">No PhilHealth settings found for this employee.</p>
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
							{employee?.pagibig_settings ? (
								<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold text-slate-900">Pag-IBIG</h3>
										<button onClick={() => setOpenEditPagIBIGModal(true)}>
											<SquarePen size={16} className=" text-slate-600" />
										</button>
									</div>
									<div className="space-y-3">
										<div>
											<p className="text-xs text-slate-600 uppercase font-semibold">Pag-IBIG Number</p>
											<p className="text-sm font-medium text-slate-900 mt-1">{employee?.pagibig_settings.pagibig_no || 'N/A'}</p>
										</div>
										<div>
											<p className="text-xs text-slate-600 uppercase font-semibold">Rate</p>
											<p className="text-sm font-medium text-slate-900 mt-1">{employee?.pagibig_settings.contribution?.total_rate}%</p>
										</div>
										<div>
											<p className="text-xs text-slate-600 uppercase font-semibold">Contribution</p>
											<p className="text-sm font-medium text-slate-900 mt-1">PHP {employee?.pagibig_settings.contribution?.total}</p>
										</div>
									</div>
								</div>
							) : (
								<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">Pag-IBIG</h3>
									<p className="text-sm font-medium text-slate-900 mt-1">No Pag-IBIG settings found for this employee.</p>
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

							{/* BIR */}
							{employee?.bir_settings ? (
								<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold text-slate-900">BIR </h3>
										<button onClick={() => setOpenEditBIRModal(true)}>
											<SquarePen size={16} className=" text-slate-600" />
										</button>
									</div>
									<div className="space-y-3">
										<div>
											<p className="text-xs text-slate-600 uppercase font-semibold">TIN Number</p>
											<p className="text-sm font-medium text-slate-900 mt-1">{employee?.bir_settings.tin_no || 'N/A'}</p>
										</div>
									</div>
								</div>
							) : (
								<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
									<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">BIR</h3>
									<p className="text-sm font-medium text-slate-900 mt-1">No BIR settings found for this employee.</p>
									<Button
										theme="outline"
										text="Add BIR Settings"
										icon={{
											position: 'left',
											content: <Plus size={16} />,
										}}
										className="mt-4"
										onClick={() => {
											setOpenBIRModal(true);
										}}
									/>
								</div>
							)}
						</div>
					</div>
				</section>

				{/* Actibons - DELETE and ARCHIVE */}
				<section className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6 flex flex-col gap-2">
					<div className="flex items-center justify-between border-b border-slate-200 gap-2 p-4">
						<div className="max-w-md">
							<h1 className="font-medium text-md mb-1">Archive Employee Record</h1>
							<p className="text-sm text-slate-500">Archive the employee record to remove it from active lists without permanently deleting the data.</p>
						</div>
						<Button
							text="Archive"
							icon={{
								position: 'left',
								content: <Archive size={14} />,
							}}
							theme="outline"
							onClick={() => setShowArchiveModal(true)}
						/>
					</div>
					<div className="flex items-center justify-between gap-2 p-4">
						<div className="max-w-md">
							<h1 className="font-medium text-md mb-1">Delete Employee Record</h1>
							<p className="text-sm text-slate-500">Delete the record permanently or archive it for future reference. Archived records can be restored later if needed.</p>
						</div>
						<Button
							text="Delete"
							icon={{
								position: 'left',
								content: <Trash size={14} />,
							}}
							theme="outline"
							onClick={() => setShowDeleteModal(true)}
						/>
					</div>
				</section>

				{/* Meta Information */}
				<section className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
					<p className="text-xs text-slate-600">
						Last updated: {formatDate(employee?.updated_at)} | Created: {formatDate(employee?.created_at)}
					</p>
				</section>
			</div>

			{/* Edit Personal Information Modal */}
			{openPersonalInfoModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
						{/* Modal Header */}
						<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
							<h3 className="text-lg font-semibold text-slate-900">Edit Personal Information</h3>
							<button onClick={() => setOpenPersonalInfoModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
								<X className="w-5 h-5 text-slate-600" />
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* First Name */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
									<input
										type="text"
										name="first_name"
										value={formData.first_name}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Middle Name */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Middle Name</label>
									<input
										type="text"
										name="middle_name"
										value={formData.middle_name}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Last Name */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
									<input
										type="text"
										name="last_name"
										value={formData.last_name}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Civil Status */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Civil Status</label>
									<select
										name="civil_status"
										value={formData.civil_status}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Select Civil Status</option>
										<option value="Single">Single</option>
										<option value="Married">Married</option>
										<option value="Divorced">Divorced</option>
										<option value="Widowed">Widowed</option>
									</select>
								</div>

								{/* Birth Date */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Birth Date</label>
									<input
										type="date"
										name="birth_date"
										value={formData.birth_date}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Birth Place */}
								<div className="md:col-span-2">
									<label className="block text-sm font-semibold text-slate-700 mb-2">Birth Place</label>
									<input
										type="text"
										name="birth_place"
										value={formData.birth_place}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Citizenship */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Citizenship</label>
									<input
										type="text"
										name="citizenship"
										value={formData.citizenship}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Religion */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Religion</label>
									<input
										type="text"
										name="religion"
										value={formData.religion}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
						</div>

						{/* Modal Footer */}
						<div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 sticky bottom-0">
							<button
								onClick={() => setOpenPersonalInfoModal(false)}
								className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleSavePersonalInfo}
								disabled={edit_personal_info_mutation.isPending}
								className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
							>
								{edit_personal_info_mutation.isPending ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Edit Contact Information Modal */}
			{openContactInfoModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
						{/* Modal Header */}
						<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
							<h3 className="text-lg font-semibold text-slate-900">Edit Contact Information</h3>
							<button onClick={() => setOpenContactInfoModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
								<X className="w-5 h-5 text-slate-600" />
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-6">
							<div className="grid grid-cols-1 gap-4">
								{/* Email */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
									<input
										type="email"
										name="email"
										value={contactFormData.email}
										onChange={handleContactFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Contact Number */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
									<input
										type="tel"
										name="contact_no"
										value={contactFormData.contact_no}
										onChange={handleContactFormChange}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
						</div>

						{/* Modal Footer */}
						<div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
							<button
								onClick={() => setOpenContactInfoModal(false)}
								className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveContactInfo}
								disabled={edit_personal_info_mutation.isPending}
								className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400"
							>
								{edit_personal_info_mutation.isPending ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Edit Family Members Modal */}
			{openRelativesModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal Header */}
						<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-10">
							<h3 className="text-lg font-semibold text-slate-900">Edit Family Members</h3>
							<button onClick={() => setOpenRelativesModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
								<X className="w-5 h-5 text-slate-600" />
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-6">
							<div className="space-y-6">
								{relativesFormData.map((relative, index) => (
									<div key={index} className="border border-slate-300 rounded-lg p-4 bg-slate-50 relative">
										<div className="flex justify-between items-start mb-4">
											<h4 className="text-sm font-semibold text-slate-900">Family Member {index + 1}</h4>
											<button
												type="button"
												onClick={() => handleRemoveRelative(index)}
												className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
												title="Remove family member"
											>
												<X className="w-5 h-5" />
											</button>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{/* First Name */}
											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
												<input
													type="text"
													value={relative.first_name || ''}
													onChange={(e) => handleRelativeChange(index, 'first_name', e.target.value)}
													className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>

											{/* Middle Name */}
											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">Middle Name</label>
												<input
													type="text"
													value={relative.middle_name || ''}
													onChange={(e) => handleRelativeChange(index, 'middle_name', e.target.value)}
													className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>

											{/* Last Name */}
											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
												<input
													type="text"
													value={relative.last_name || ''}
													onChange={(e) => handleRelativeChange(index, 'last_name', e.target.value)}
													className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>

											{/* Relationship */}
											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">Relationship</label>
												<input
													type="text"
													value={relative.relationship || ''}
													onChange={(e) => handleRelativeChange(index, 'relationship', e.target.value)}
													className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>

											{/* Contact Number */}
											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
												<input
													type="tel"
													value={relative.contact_no || ''}
													onChange={(e) => handleRelativeChange(index, 'contact_no', e.target.value)}
													className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>

											{/* Occupation */}
											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">Occupation</label>
												<input
													type="text"
													value={relative.occupation || ''}
													onChange={(e) => handleRelativeChange(index, 'occupation', e.target.value)}
													className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
												/>
											</div>

											{/* Birth Date */}
											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">Birth Date</label>
												<input
													type="date"
													value={relative.birth_date ? relative.birth_date.split('T')[0] : ''}
													onChange={(e) => handleRelativeChange(index, 'birth_date', e.target.value)}
													className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
												/>
											</div>

											{/* Birth Place */}
											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">Birth Place</label>
												<input
													type="text"
													value={relative.birth_place || ''}
													onChange={(e) => handleRelativeChange(index, 'birth_place', e.target.value)}
													className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
												/>
											</div>

											{/* Address */}
											<div className="md:col-span-2">
												<label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
												<input
													type="text"
													value={relative.address || ''}
													onChange={(e) => handleRelativeChange(index, 'address', e.target.value)}
													className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
												/>
											</div>
										</div>
									</div>
								))}
								<button
									type="button"
									onClick={handleAddRelative}
									className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-500 hover:text-slate-600 hover:bg-slate-50 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
								>
									<Plus className="w-5 h-5" />
									Add New Family Member
								</button>
							</div>
						</div>

						{/* Modal Footer */}
						<div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 z-10">
							<button
								onClick={() => setOpenRelativesModal(false)}
								className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={() => {
									edit_relatives_mutation.mutate(relativesFormData);
								}}
								disabled={edit_relatives_mutation.isPending}
								className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400"
							>
								{edit_relatives_mutation.isPending ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Salary History Modal */}
			{openSalaryModal && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal Header */}
						<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0 z-10">
							<h3 className="text-lg font-semibold text-slate-900">Salary History</h3>
							<button onClick={() => setOpenSalaryModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
								<X className="w-5 h-5 text-slate-600" />
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-6">
							<div className="space-y-6">
								{/* Add New Salary Entry */}
								<div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
									<h4 className="text-sm font-semibold text-slate-900 mb-4">Add New Salary Entry</h4>
									<div className="flex items-end gap-3">
										<div className="flex-1">
											<label className="block text-sm font-semibold text-slate-700 mb-2">Salary Amount</label>
											<input
												type="number"
												defaultValue={newSalaryAmount}
												onChange={(e) => setNewSalaryAmount(parseFloat(e.target.value) || 0)}
												placeholder="Enter salary amount"
												className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
												min="0"
												step="0.01"
											/>
										</div>
										<button
											disabled={newSalaryAmount === 0}
											onClick={handleAddSalaryEntry}
											className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
										>
											<Plus className="w-4 h-4" />
											Add
										</button>
									</div>
								</div>

								{/* Salary History List */}
								<div>
									<h4 className="text-sm font-semibold text-slate-900 mb-4">History</h4>
									{salaryFormData.length === 0 ? (
										<p className="text-sm text-slate-500 text-center py-4">No salary history yet</p>
									) : (
										<div className="space-y-3">
											{salaryFormData
												.slice()
												.reverse()
												.map((salary, reverseIndex) => {
													const actualIndex = salaryFormData.length - 1 - reverseIndex;
													return (
														<div
															key={actualIndex}
															className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
														>
															<div>
																<p className="text-sm font-medium text-slate-600">
																	Entry {actualIndex === salaryFormData.length - 1 ? '(Latest)' : ''}
																</p>
																<p className="text-xs text-slate-500 mt-1">{formatDate(salary?.updated_at)}</p>
															</div>
															<div className="flex items-center gap-3">
																<span className="text-lg font-semibold text-slate-900">
																	₱{salary?.amount ? salary.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
																</span>
															</div>
														</div>
													);
												})}
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Modal Footer */}
						<div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 z-10">
							<button
								onClick={() => setOpenSalaryModal(false)}
								className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveSalaryHistory}
								disabled={edit_personal_info_mutation.isPending || employee?.salary_history.length === salaryFormData.length}
								className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400"
							>
								{edit_personal_info_mutation.isPending ? 'Saving...' : 'Save Changes'}
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
									<label htmlFor="sss_no" className="block text-sm font-medium text-slate-700">
										SSS No.
									</label>
									<input
										type="text"
										id="sss_no"
										value={sssSettings.sss_no}
										onChange={(e) => handleSSSChange('sss_no', e.target.value)}
										placeholder="XX-XXXXXXX-X"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 px-6 py-4">
								<Button text="Cancel" onClick={() => setOpenSSSModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handleSSSSave} />
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
									<label htmlFor="philhealth_no" className="block text-sm font-medium text-slate-700">
										PhilHealth No.
									</label>
									<input
										type="text"
										id="philhealth_no"
										value={philhealthSettings.philhealth_no}
										onChange={(e) => handlePhilhealthChange('philhealth_no', e.target.value)}
										placeholder="12-XXXXXXXXXXXX-X"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 px-6 py-4">
								<Button text="Cancel" onClick={() => setOpenPhilHealthModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handlePhilHealthSave} />
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
									<label htmlFor="pagibig_no" className="block text-sm font-medium text-slate-700">
										Pag-IBIG No.
									</label>
									<input
										type="text"
										id="pagibig_no"
										value={pagibigSettings.pagibig_no}
										onChange={(e) => handlePagIBIGChange('pagibig_no', e.target.value)}
										placeholder="XXXXXXXXXXXXXXX"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 p-4">
								<Button text="Cancel" onClick={() => setOpenPagIBIGModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handlePagIBIGSave} />
							</div>
						</div>
					</div>
				</>
			)}
			{openBIRModal && (
				<>
					<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
							{/* Modal Header */}
							<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
								<h3 className="text-lg font-semibold text-slate-900">Edit BIR Information</h3>
								<button onClick={() => setOpenBIRModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
								<div className="flex flex-col gap-2">
									<label htmlFor="bir_tin" className="block text-sm font-medium text-slate-700">
										TIN No.
									</label>
									<input
										type="text"
										id="bir_tin"
										value={birSettings.tin_no}
										onChange={(e) => handleBIRChange('tin_no', e.target.value)}
										placeholder="XXX-XXX-XXX-XXX"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 px-6 py-4">
								<Button text="Cancel" onClick={() => setOpenBIRModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handleBIRSave} />
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

							<div className="grid grid-cols-1  gap-4 px-6 py-4">
								<div className="flex flex-col gap-2">
									<label htmlFor="sss_no" className="block text-sm font-medium text-slate-700">
										SSS No.
									</label>
									<input
										type="text"
										id="sss_no"
										ref={sssEditNoInputRef}
										defaultValue={employee?.sss_settings?.sss_no || ''}
										placeholder="XX-XXXXXXX-X"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
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
									<label htmlFor="philhealth_no" className="block text-sm font-medium text-slate-700">
										PhilHealth No.
									</label>
									<input
										type="text"
										id="philhealth_no"
										ref={philHealthNoEditInputRef}
										defaultValue={employee.philhealth_settings?.philhealth_no || ''}
										placeholder="12-XXXXXXXXXXXX-X"
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
									<label htmlFor="pagibig_no" className="block text-sm font-medium text-slate-700">
										Pag-IBIG No.
									</label>
									<input
										type="text"
										ref={pagibigNoEditInputRef}
										id="pagibig_no"
										defaultValue={employee.pagibig_settings?.pagibig_no || ''}
										placeholder="XXXXXXXXXXXXXXX"
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
			{openEditBIRModal && (
				<>
					<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
							{/* Modal Header */}
							<div className="flex justify-between items-center bg-white px-6 py-4 border-b border-slate-200 sticky top-0">
								<h3 className="text-lg font-semibold text-slate-900">Edit BIR Information</h3>
								<button onClick={() => setOpenEditBIRModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
								<div className="flex flex-col gap-2">
									<label htmlFor="bir_tin" className="block text-sm font-medium text-slate-700">
										TIN No.
									</label>
									<input
										ref={tinEditInputRef}
										type="text"
										id="bir_tin"
										defaultValue={employee.bir_settings?.tin_no || ''}
										placeholder="XXX-XXX-XXX-XXX"
										className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
									/>
								</div>
							</div>

							<div className="flex justify-end items-center gap-2 mt-2 px-6 py-4">
								<Button text="Cancel" onClick={() => setOpenEditBIRModal(false)} theme="outline" />
								<Button text="Save Changes" theme="default" onClick={handleEditBIRSave} />
							</div>
						</div>
					</div>
				</>
			)}

			<ConfirmationModal
				isOpen={showArchiveModal}
				type="archive"
				title="Archive Employee"
				message={`Are you sure you want to archive ${employee?.first_name} ${employee?.last_name}? They will be moved to the archives and removed from active lists.`}
				isLoading={archive_employee_mutation.isPending}
				onConfirm={() => archive_employee_mutation.mutate()}
				onCancel={() => setShowArchiveModal(false)}
			/>

			<ConfirmationModal
				isOpen={showDeleteModal}
				type="delete"
				title="Delete Employee"
				message={`Are you sure you want to permanently delete ${employee?.first_name} ${employee?.last_name}? This action cannot be undone and all associated data will be removed.`}
				isLoading={delete_employee_mutation.isPending}
				onConfirm={() => delete_employee_mutation.mutate()}
				onCancel={() => setShowDeleteModal(false)}
			/>

			<LoadingModal
				open={
					add_pagibig_mutation.isPending ||
					add_philhealth_mutation.isPending ||
					add_sss_mutation.isPending ||
					add_bir_mutation.isPending ||
					edit_personal_info_mutation.isPending ||
					edit_relatives_mutation.isPending ||
					edit_contact_info_mutation.isPending ||
					edit_salary_mutation.isPending ||
					edit_bir_mutation.isPending ||
					edit_pagibig_mutation.isPending ||
					edit_philhealth_mutation.isPending ||
					edit_sss_mutation.isPending
				}
				message={'Saving changes...'}
			/>
		</main>
	);
};

export default Employee;
