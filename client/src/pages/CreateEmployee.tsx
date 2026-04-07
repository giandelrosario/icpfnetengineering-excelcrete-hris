import Button from '@/components/Button';
import LoadingModal from '@/components/LoadingModal';
import useAxios from '@/hooks/useAxios';
import { CIVIL_STATUS } from '@/utils/lib';
import { useGSAP } from '@gsap/react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight, Edit2, Grid2x2, IdCard, Plus, Trash2, Users, XCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

type TEmployeeRelative = {
	first_name: string;
	middle_name: string;
	last_name: string;
	relationship: string;
	contact_no: string;
	address: string;
	occupation: string;
	birth_date: string;
	birth_place: string;
};

type TSalaryHistory = {
	amount: number;
};

type TSSSSettings = {
	sss_no: string;
};
type TPhilhealthSettings = {
	philhealth_no: string;
};
type TPagIBIGSettings = {
	pagibig_no: string;
	ee_share_rate: number;
};
type TBIRSettings = {
	tin_no: string;
};

const initialRelative: TEmployeeRelative = {
	first_name: '',
	middle_name: '',
	last_name: '',
	relationship: '',
	contact_no: '',
	address: '',
	occupation: '',
	birth_date: '',
	birth_place: '',
};

type TEmployeeDetails = {
	first_name: string;
	middle_name: string;
	last_name: string;
	email: string;
	contact_no: string;
	citizenship: string;
	civil_status: string;
	religion: string;
	birth_date: string;
	birth_place: string;
	hire_date: string;
};

const initialEmployeeDetails: TEmployeeDetails = {
	first_name: '',
	middle_name: '',
	last_name: '',
	email: '',
	contact_no: '',
	citizenship: '',
	civil_status: '',
	religion: '',
	birth_date: '',
	birth_place: '',
	hire_date: '',
};

const CreateEmployee = () => {
	const [step, setStep] = useState(1);
	const [showSummaryModal, setShowSummaryModal] = useState(false);
	const [validationModal, setValidationModal] = useState({
		isOpen: false,
		title: 'Incomplete Details',
		message: 'Please complete the required fields before continuing.',
		items: [] as string[],
	});

	const navigate = useNavigate();

	// Step 1: Employee Details
	const [employeeDetails, setEmployeeDetails] = useState<TEmployeeDetails>({ ...initialEmployeeDetails });

	// Step 2: Relatives
	const [relatives, setRelatives] = useState<TEmployeeRelative[]>([]);
	const [relativeFormData, setRelativeFormData] = useState<TEmployeeRelative>({ ...initialRelative });
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	// Step 3: Statutory Benefits Form Data
	const [salaryHistory, setSalaryHistory] = useState<TSalaryHistory>({ amount: 0 });
	const [sssSettings, setSSSSettings] = useState<TSSSSettings>({ sss_no: '' });
	const [philhealthSettings, setPhilhealthSettings] = useState<TPhilhealthSettings>({ philhealth_no: '' });
	const [pagibigSettings, setPagIBIGSettings] = React.useState<TPagIBIGSettings>({ pagibig_no: '', ee_share_rate: 2 });
	const [birSettings, setBIRSettings] = useState<TBIRSettings>({ tin_no: '' });

	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Something went wrong. Please try again later.');

	// Benefit selections (checkboxes)
	const [selectedBenefits, setSelectedBenefits] = useState({
		hasSalary: false,
		hasSSS: false,
		hasPhilHealth: false,
		hasPagIBIG: false,
		hasBIR: false,
	});

	const sectionRef = useRef<HTMLElement>(null);
	const stepIndicatorsRef = useRef<(HTMLLIElement | null)[]>([]);

	const api = useAxios();

	const create_employee_mutation = useMutation({
		mutationFn: async (
			payload: TEmployeeDetails & {
				relatives: TEmployeeRelative[];
				salary?: TSalaryHistory;
				sss_settings?: TSSSSettings;
				philhealth_settings?: TPhilhealthSettings;
				pagibig_settings?: TPagIBIGSettings;
				bir_settings?: TBIRSettings;
			},
		) => {
			const response = await api.post('/employee', payload);
			return response.data;
		},
		onSuccess: () => {
			navigate('/dashboard/employees');
		},
		onError: (error) => {
			if (isAxiosError(error)) {
				const message = error.response?.data?.message || 'An error occurred while creating the employee.';
				setErrorMessage(message);
				setShowErrorModal(true);
			}
		},
		onSettled: () => {
			setStep(1);
			setRelativeFormData({ ...initialRelative });
			setEmployeeDetails({ ...initialEmployeeDetails });
			setRelatives([]);
			setSelectedBenefits({
				hasSalary: false,
				hasSSS: false,
				hasPhilHealth: false,
				hasPagIBIG: false,
				hasBIR: false,
			});
			setSalaryHistory({ amount: 0 });
			setSSSSettings({ sss_no: '' });
			setPhilhealthSettings({ philhealth_no: '' });
			setPagIBIGSettings({ pagibig_no: '', ee_share_rate: 0 });
			setBIRSettings({ tin_no: '' });
			setShowSummaryModal(false);
		},
	});

	useGSAP(() => {
		if (sectionRef.current) {
			gsap.fromTo(
				sectionRef.current,
				{
					opacity: 0,
					y: 5,
				},
				{
					opacity: 1,
					y: 0,
					duration: 0.5,
					ease: 'power2.out',
				},
			);
		}
	}, [step]);

	useGSAP(() => {
		// Animate the active step indicator
		stepIndicatorsRef.current.forEach((indicator, index) => {
			if (indicator) {
				gsap.to(indicator, {
					scale: index + 1 === step ? 1.05 : 1,
					duration: 0.3,
					ease: 'power2.out',
				});
			}
		});
	}, [step]);

	const handleStepChange = (newStep: number) => {
		if (newStep > step) {
			if (step === 1) {
				const requiredFields: { key: keyof TEmployeeDetails; label: string }[] = [
					{ key: 'first_name', label: 'First Name' },
					{ key: 'last_name', label: 'Last Name' },
					{ key: 'citizenship', label: 'Citizenship' },
					{ key: 'civil_status', label: 'Civil Status' },
					{ key: 'religion', label: 'Religion' },
					{ key: 'email', label: 'Email' },
					{ key: 'contact_no', label: 'Contact No.' },
					{ key: 'birth_date', label: 'Birth Date' },
					{ key: 'birth_place', label: 'Birth Place' },
					{ key: 'hire_date', label: 'Hire Date' },
				];

				const missingFields = requiredFields.filter(({ key }) => !employeeDetails[key].trim()).map(({ label }) => label);

				if (missingFields.length > 0) {
					setValidationModal({
						isOpen: true,
						title: 'Complete Employee Details',
						message: 'Please complete the following fields before continuing:',
						items: missingFields,
					});
					return;
				}
			}

			if (step === 2) {
				if (relatives.length < 1 || relatives.length > 2) {
					setValidationModal({
						isOpen: true,
						title: 'Relatives Required',
						message: 'Please add 1 or 2 relatives before continuing.',
						items: [],
					});
					return;
				}
			}
		}

		// Animate button click
		gsap.to('button', {
			scale: 0.95,
			duration: 0.1,
			yoyo: true,
			repeat: 1,
		});
		setStep(newStep);
	};

	const handleRelativeFormChange = (field: keyof TEmployeeRelative, value: string) => {
		setRelativeFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleAddRelative = () => {
		if (!relativeFormData.first_name.trim() || !relativeFormData.last_name.trim()) {
			alert('Please fill in First Name and Last Name');
			return;
		}

		if (editingIndex !== null) {
			// Update existing relative
			const updatedRelatives = [...relatives];
			updatedRelatives[editingIndex] = relativeFormData;
			setRelatives(updatedRelatives);
			setEditingIndex(null);
		} else {
			// Add new relative
			setRelatives((prev) => [...prev, { ...relativeFormData }]);
		}

		// Reset form
		setRelativeFormData({ ...initialRelative });
	};

	const handleEditRelative = (index: number) => {
		setRelativeFormData(relatives[index]);
		setEditingIndex(index);
	};

	const handleDeleteRelative = (index: number) => {
		if (relatives.length === 1) {
			alert('You must have at least one relative');
			return;
		}
		setRelatives((prev) => prev.filter((_, i) => i !== index));
	};

	const handleCancelEdit = () => {
		setRelativeFormData({ ...initialRelative });
		setEditingIndex(null);
	};

	// Handlers for Statutory Benefits Form
	const handleSalaryChange = (field: keyof TSalaryHistory, value: string) => {
		setSalaryHistory((prev) => ({
			...prev,
			[field]: parseFloat(value),
		}));
	};

	const handleSSSChange = (field: keyof TSSSSettings, value: string) => {
		setSSSSettings((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handlePhilhealthChange = (field: keyof TPhilhealthSettings, value: string) => {
		setPhilhealthSettings((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handlePagIBIGChange = (field: keyof TPagIBIGSettings, value: string) => {
		setPagIBIGSettings((prev) => ({
			...prev,
			[field]: field === 'ee_share_rate' ? parseFloat(value) : value,
		}));
	};

	const handleBIRChange = (field: keyof TBIRSettings, value: string) => {
		setBIRSettings((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleEmployeeDetailsChange = (field: keyof TEmployeeDetails, value: string) => {
		setEmployeeDetails((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleToggleBenefit = (benefit: keyof typeof selectedBenefits) => {
		setSelectedBenefits((prev) => ({
			...prev,
			[benefit]: !prev[benefit],
		}));
	};

	const handleShowSummary = () => {
		setShowSummaryModal(true);
	};

	const createEmployee = async () => {
		// Construct payload with only selected benefits
		const payload: TEmployeeDetails & {
			relatives: TEmployeeRelative[];
			salary?: TSalaryHistory;
			sss_settings?: TSSSSettings;
			philhealth_settings?: TPhilhealthSettings;
			pagibig_settings?: TPagIBIGSettings;
			bir_settings?: TBIRSettings;
		} = {
			first_name: employeeDetails.first_name,
			middle_name: employeeDetails.middle_name,
			last_name: employeeDetails.last_name,
			email: employeeDetails.email,
			contact_no: employeeDetails.contact_no,
			citizenship: employeeDetails.citizenship,
			civil_status: employeeDetails.civil_status,
			religion: employeeDetails.religion,
			birth_date: employeeDetails.birth_date,
			birth_place: employeeDetails.birth_place,
			hire_date: employeeDetails.hire_date,
			relatives: relatives,
		};
		// Add only selected benefits to payload
		if (selectedBenefits.hasSalary) {
			payload.salary = salaryHistory;
		}
		if (selectedBenefits.hasSSS) {
			payload.sss_settings = sssSettings;
		}
		if (selectedBenefits.hasPhilHealth) {
			payload.philhealth_settings = philhealthSettings;
		}
		if (selectedBenefits.hasPagIBIG) {
			payload.pagibig_settings = { ...pagibigSettings, ee_share_rate: 2 };
		}
		if (selectedBenefits.hasBIR) {
			payload.bir_settings = birSettings;
		}

		console.log(payload);
		create_employee_mutation.mutate(payload);
	};

	const handleConfirmCreate = () => {
		setShowSummaryModal(false);
		createEmployee();
	};

	return (
		<main className="bg-slate-50 min-h-screen w-full">
			<div className="container mx-auto p-4 space-y-4">
				<div>
					<button onClick={() => navigate(-1)} className="rounded-full bg-white p-2 border border-slate-200 hover:bg-slate-50">
						<ArrowLeft size={20} className="text-slate-600 hover:text-slate-900 transition-colors" />
					</button>
				</div>
				<div>
					<h2 className="text-lg font-medium text-slate-700">Create Employee</h2>
					<p className="text-sm text-slate-500">create employee form goes here. This will be a multi-step form with the following sections:</p>
				</div>

				<div>
					<ol className="grid grid-cols-1 divide-x divide-gray-100 overflow-hidden rounded-lg border border-gray-100 text-sm text-gray-600 sm:grid-cols-3">
						<li
							ref={(el) => {
								if (el) stepIndicatorsRef.current[0] = el;
							}}
							className={`flex items-center justify-center gap-2 p-4 ${step === 1 ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}
						>
							<IdCard size={32} />
							<div className="leading-none">
								<h1 className="block font-medium"> Details </h1>
								<p className="mt-1 text-xs"> Some info about you. </p>
							</div>
						</li>

						<li
							ref={(el) => {
								if (el) stepIndicatorsRef.current[1] = el;
							}}
							className={`relative flex items-center justify-center gap-2 ${step === 2 ? 'bg-slate-900 text-white' : 'bg-white'} p-4`}
						>
							<Users size={32} />

							<div className="leading-none">
								<h1 className="block font-medium"> Relatives </h1>
								<p className="mt-1 text-xs"> Who are you related to? </p>
							</div>
						</li>

						<li
							ref={(el) => {
								if (el) stepIndicatorsRef.current[2] = el;
							}}
							className={`flex items-center justify-center gap-2 p-4 ${step === 3 ? 'bg-slate-900 text-white' : 'bg-white'}`}
						>
							<Grid2x2 size={32} />

							<div className="leading-none">
								<h1 className="block font-medium"> Statutory Benefits </h1>
								<p className="mt-1 text-xs">Which benefits?</p>
							</div>
						</li>
					</ol>
				</div>

				{/* Step Content */}
				{step === 1 && (
					<section ref={sectionRef} className="bg-white border border-slate-200 rounded-lg p-4">
						<span className="sr-only">Details</span>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="flex flex-col gap-2">
								<label htmlFor="first_name" className="block text-sm font-medium text-slate-700">
									First Name
								</label>
								<input
									type="text"
									id="first_name"
									value={employeeDetails.first_name}
									onChange={(e) => handleEmployeeDetailsChange('first_name', e.target.value)}
									placeholder="Enter First Name"
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="middle_name" className="block text-sm font-medium text-slate-700">
									Middle Name
								</label>
								<input
									type="text"
									id="middle_name"
									value={employeeDetails.middle_name}
									onChange={(e) => handleEmployeeDetailsChange('middle_name', e.target.value)}
									placeholder="Enter Middle Name"
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="last_name" className="block text-sm font-medium text-slate-700">
									Last Name
								</label>
								<input
									type="text"
									id="last_name"
									value={employeeDetails.last_name}
									onChange={(e) => handleEmployeeDetailsChange('last_name', e.target.value)}
									placeholder="Enter Last Name"
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="citizenship" className="block text-sm font-medium text-slate-700">
									Citizenship
								</label>
								<input
									type="text"
									id="citizenship"
									value={employeeDetails.citizenship}
									onChange={(e) => handleEmployeeDetailsChange('citizenship', e.target.value)}
									placeholder="Enter Citizenship"
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="civil_status" className="block text-sm font-medium text-slate-700">
									Civil Status
								</label>
								<select
									id="civil_status"
									value={employeeDetails.civil_status}
									onChange={(e) => handleEmployeeDetailsChange('civil_status', e.target.value)}
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								>
									<option value="">Select Civil Status</option>
									{CIVIL_STATUS.map((status) => (
										<option key={status} value={status}>
											{status}
										</option>
									))}
								</select>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="religion" className="block text-sm font-medium text-slate-700">
									Religion
								</label>
								<input
									type="text"
									id="religion"
									value={employeeDetails.religion}
									onChange={(e) => handleEmployeeDetailsChange('religion', e.target.value)}
									placeholder="Enter Religion"
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="email" className="block text-sm font-medium text-slate-700">
									Email
								</label>
								<input
									type="text"
									id="email"
									value={employeeDetails.email}
									onChange={(e) => handleEmployeeDetailsChange('email', e.target.value)}
									placeholder="Enter Email"
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="contact_no" className="block text-sm font-medium text-slate-700">
									Contact No.
								</label>
								<input
									type="text"
									id="contact_no"
									value={employeeDetails.contact_no}
									onChange={(e) => handleEmployeeDetailsChange('contact_no', e.target.value)}
									placeholder="Enter Contact No."
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="birth_date" className="block text-sm font-medium text-slate-700">
									Birth Date
								</label>
								<input
									type="date"
									id="birth_date"
									value={employeeDetails.birth_date}
									onChange={(e) => handleEmployeeDetailsChange('birth_date', e.target.value)}
									placeholder="Enter Birth Date"
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="hire_date" className="block text-sm font-medium text-slate-700">
									Hire Date
								</label>
								<input
									type="date"
									id="hire_date"
									value={employeeDetails.hire_date}
									onChange={(e) => handleEmployeeDetailsChange('hire_date', e.target.value)}
									placeholder="Enter Hire Date"
									className="text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
								/>
							</div>
						</div>
						<div className="mt-2 space-y-2">
							<label htmlFor="birth_place" className="block text-sm font-medium text-slate-700">
								Birth Place
							</label>
							<textarea
								id="birth_place"
								value={employeeDetails.birth_place}
								onChange={(e) => handleEmployeeDetailsChange('birth_place', e.target.value)}
								placeholder="Enter Birth Place"
								className="w-full text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
							/>
						</div>
					</section>
				)}

				{step === 2 && (
					<section ref={sectionRef} className="bg-white border border-slate-200 rounded-lg p-4">
						<span className="sr-only">Relatives</span>

						<div className="space-y-6">
							{/* Add/Edit Relative Form */}
							<div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
								<h3 className="text-md font-semibold text-slate-900 mb-4">{editingIndex !== null ? `Edit Relative #${editingIndex + 1}` : 'Add New Relative'}</h3>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="flex flex-col gap-2">
										<label htmlFor="rel_first_name" className="block text-sm font-medium text-slate-700">
											First Name <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											id="rel_first_name"
											value={relativeFormData.first_name}
											onChange={(e) => handleRelativeFormChange('first_name', e.target.value)}
											placeholder="Enter First Name"
											className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<label htmlFor="rel_middle_name" className="block text-sm font-medium text-slate-700">
											Middle Name
										</label>
										<input
											type="text"
											id="rel_middle_name"
											value={relativeFormData.middle_name}
											onChange={(e) => handleRelativeFormChange('middle_name', e.target.value)}
											placeholder="Enter Middle Name"
											className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<label htmlFor="rel_last_name" className="block text-sm font-medium text-slate-700">
											Last Name <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											id="rel_last_name"
											value={relativeFormData.last_name}
											onChange={(e) => handleRelativeFormChange('last_name', e.target.value)}
											placeholder="Enter Last Name"
											className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<label htmlFor="rel_relationship" className="block text-sm font-medium text-slate-700">
											Relationship
										</label>
										<input
											type="text"
											id="rel_relationship"
											value={relativeFormData.relationship}
											onChange={(e) => handleRelativeFormChange('relationship', e.target.value)}
											placeholder="e.g., Father, Mother, Sister"
											className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<label htmlFor="rel_contact_no" className="block text-sm font-medium text-slate-700">
											Contact No.
										</label>
										<input
											type="text"
											id="rel_contact_no"
											value={relativeFormData.contact_no}
											onChange={(e) => handleRelativeFormChange('contact_no', e.target.value)}
											placeholder="Enter Contact No."
											className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<label htmlFor="rel_occupation" className="block text-sm font-medium text-slate-700">
											Occupation
										</label>
										<input
											type="text"
											id="rel_occupation"
											value={relativeFormData.occupation}
											onChange={(e) => handleRelativeFormChange('occupation', e.target.value)}
											placeholder="Enter Occupation"
											className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<label htmlFor="rel_birth_date" className="block text-sm font-medium text-slate-700">
											Birth Date
										</label>
										<input
											type="date"
											id="rel_birth_date"
											value={relativeFormData.birth_date}
											onChange={(e) => handleRelativeFormChange('birth_date', e.target.value)}
											className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<label htmlFor="rel_birth_place" className="block text-sm font-medium text-slate-700">
											Birth Place
										</label>
										<input
											type="text"
											id="rel_birth_place"
											value={relativeFormData.birth_place}
											onChange={(e) => handleRelativeFormChange('birth_place', e.target.value)}
											placeholder="Enter Birth Place"
											className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
										/>
									</div>
								</div>

								<div className="mt-4 space-y-2">
									<label htmlFor="rel_address" className="block text-sm font-medium text-slate-700">
										Address
									</label>
									<textarea
										id="rel_address"
										value={relativeFormData.address}
										onChange={(e) => handleRelativeFormChange('address', e.target.value)}
										placeholder="Enter Address"
										className="bg-white w-full text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300"
										rows={3}
									/>
								</div>

								<div className="mt-4 flex gap-2">
									<Button
										onClick={handleAddRelative}
										theme="default"
										text={editingIndex !== null ? 'Update Relative' : 'Add Relative'}
										icon={{
											position: 'left',
											content: <Plus size={16} className="text-white" />,
										}}
									/>
									{editingIndex !== null && <Button onClick={handleCancelEdit} theme="outline" text="Cancel" />}
								</div>
							</div>

							{/* List of Added Relatives */}
							<div>
								<h3 className="text-md font-semibold text-slate-900 mb-4">Added Relatives ({relatives.length})</h3>

								{relatives.length === 0 ? (
									<div className="text-center py-8">
										<p className="text-slate-500 text-sm">No relatives added yet. Add one to get started!</p>
									</div>
								) : (
									<div className="space-y-3">
										{relatives.map((relative, index) => (
											<div key={index} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<h4 className="font-semibold text-slate-900">
															{relative.first_name} {relative.middle_name} {relative.last_name}
														</h4>
														<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm text-slate-600">
															<div>
																<p className="font-medium text-slate-700">Relationship</p>
																<p>{relative.relationship || 'Not specified'}</p>
															</div>
															<div>
																<p className="font-medium text-slate-700">Contact No.</p>
																<p>{relative.contact_no || 'Not specified'}</p>
															</div>
															<div>
																<p className="font-medium text-slate-700">Occupation</p>
																<p>{relative.occupation || 'Not specified'}</p>
															</div>
														</div>
														<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm text-slate-600">
															<div>
																<p className="font-medium text-slate-700">Birth Date</p>
																<p>{relative.birth_date || 'Not specified'}</p>
															</div>
															<div>
																<p className="font-medium text-slate-700">Birth Place</p>
																<p>{relative.birth_place || 'Not specified'}</p>
															</div>
															<div>
																<p className="font-medium text-slate-700">Address</p>
																<p>{relative.address || 'Not specified'}</p>
															</div>
														</div>
													</div>
													<div className="flex gap-2 ml-4">
														<button
															onClick={() => handleEditRelative(index)}
															className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
															title="Edit"
														>
															<Edit2 size={18} className="text-slate-600" />
														</button>
														<button
															onClick={() => handleDeleteRelative(index)}
															className="p-2 hover:bg-red-50 rounded-lg transition-colors"
															title="Delete"
														>
															<Trash2 size={18} className="text-red-600" />
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</section>
				)}
				{step === 3 && (
					<section ref={sectionRef} className="bg-white border border-slate-200 rounded-lg p-4">
						<span className="sr-only">Statutory Benefits</span>

						<div className="mb-6">
							<h3 className="text-md font-semibold text-slate-900 mb-4">Select Benefits</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
									<input
										type="checkbox"
										checked={selectedBenefits.hasSalary}
										onChange={() => handleToggleBenefit('hasSalary')}
										className="w-5 h-5 rounded cursor-pointer"
									/>
									<span className="text-sm font-medium text-slate-700">Salary</span>
								</label>
								<label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
									<input
										type="checkbox"
										checked={selectedBenefits.hasSSS}
										onChange={() => handleToggleBenefit('hasSSS')}
										className="w-5 h-5 rounded cursor-pointer"
									/>
									<span className="text-sm font-medium text-slate-700">SSS (Social Security System)</span>
								</label>
								<label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
									<input
										type="checkbox"
										checked={selectedBenefits.hasPhilHealth}
										onChange={() => handleToggleBenefit('hasPhilHealth')}
										className="w-5 h-5 rounded cursor-pointer"
									/>
									<span className="text-sm font-medium text-slate-700">PhilHealth</span>
								</label>
								<label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
									<input
										type="checkbox"
										checked={selectedBenefits.hasPagIBIG}
										onChange={() => handleToggleBenefit('hasPagIBIG')}
										className="w-5 h-5 rounded cursor-pointer"
									/>
									<span className="text-sm font-medium text-slate-700">Pag-IBIG</span>
								</label>
								<label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
									<input
										type="checkbox"
										checked={selectedBenefits.hasBIR}
										onChange={() => handleToggleBenefit('hasBIR')}
										className="w-5 h-5 rounded cursor-pointer"
									/>
									<span className="text-sm font-medium text-slate-700">BIR (Bureau of Internal Revenue)</span>
								</label>
							</div>
						</div>

						<div className="space-y-6">
							{/* Salary History Section */}
							{selectedBenefits.hasSalary && (
								<div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
									<h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2">Salary</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex flex-col gap-2">
											<label htmlFor="salary_amount" className="block text-sm font-medium text-slate-700">
												Amount
											</label>
											<input
												type="number"
												id="salary_amount"
												value={salaryHistory.amount}
												onChange={(e) => handleSalaryChange('amount', e.target.value)}
												placeholder="0.00"
												className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
											/>
										</div>
									</div>
								</div>
							)}

							{/* SSS Settings Section */}
							{selectedBenefits.hasSSS && (
								<div className="border border-slate-200 rounded-lg p-4">
									<h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2">SSS (Social Security System)</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
								</div>
							)}

							{/* PhilHealth Settings Section */}
							{selectedBenefits.hasPhilHealth && (
								<div className="border border-slate-200 rounded-lg p-4">
									<h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2">PhilHealth</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
								</div>
							)}

							{/* Pag-IBIG Settings Section */}
							{selectedBenefits.hasPagIBIG && (
								<div className="border border-slate-200 rounded-lg p-4">
									<h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2">Pag-IBIG</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
										<div className="flex flex-col gap-2">
											<label htmlFor="pagibig_ee_share" className="block text-sm font-medium text-slate-700">
												Employee Share Rate (%)
											</label>
											<input
												type="number"
												id="pagibig_ee_share"
												value={pagibigSettings.ee_share_rate}
												onChange={(e) => handlePagIBIGChange('ee_share_rate', e.target.value)}
												placeholder="2"
												step="1"
												min={0}
												className="bg-white text-sm py-2 px-3 placeholder:text-slate-400 border border-slate-200 rounded-lg"
											/>
										</div>
									</div>
								</div>
							)}

							{/* BIR Settings Section */}
							{selectedBenefits.hasBIR && (
								<div className="border border-slate-200 rounded-lg p-4">
									<h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2">BIR (Bureau of Internal Revenue)</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
								</div>
							)}

							{/* Summary Section */}
							<div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
								<h3 className="text-md font-semibold text-slate-900 mb-3">Summary</h3>
								{Object.values(selectedBenefits).every((val) => !val) ? (
									<p className="text-slate-500 text-sm">No benefits selected</p>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
										{selectedBenefits.hasSalary && (
											<div className="bg-white rounded-lg p-3">
												<p className="text-slate-600">Salary</p>
												<p className="text-lg font-semibold text-slate-900">₱{salaryHistory.amount.toLocaleString()}</p>
											</div>
										)}
										{selectedBenefits.hasSSS && (
											<div className="bg-white rounded-lg p-3">
												<p className="text-slate-600">SSS Information</p>
												<p className="text-slate-900">{sssSettings.sss_no || 'Not set'}</p>
											</div>
										)}
										{selectedBenefits.hasPhilHealth && (
											<div className="bg-white rounded-lg p-3">
												<p className="text-slate-600">PhilHealth No.</p>
												<p className="text-slate-900">{philhealthSettings.philhealth_no || 'Not set'}</p>
											</div>
										)}
										{selectedBenefits.hasPagIBIG && (
											<div className="bg-white rounded-lg p-3">
												<p className="text-slate-600">Pag-IBIG No.</p>
												<p className="text-slate-900">{pagibigSettings.pagibig_no || 'Not set'}</p>
											</div>
										)}
										{selectedBenefits.hasBIR && (
											<div className="bg-white rounded-lg p-3">
												<p className="text-slate-600">TIN No.</p>
												<p className="text-slate-900">{birSettings.tin_no || 'Not set'}</p>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</section>
				)}
				{/* Navigation Buttons */}
				<div className="flex justify-end gap-2 items-center">
					{step > 1 && (
						<Button
							onClick={() => handleStepChange(step - 1)}
							theme="outline"
							text="Previous"
							icon={{
								position: 'left',
								content: <ArrowLeft size={16} className="text-slate-800" />,
							}}
						/>
					)}

					{step < 3 && (
						<Button
							onClick={() => handleStepChange(step + 1)}
							theme="default"
							text="Next"
							icon={{
								position: 'right',
								content: <ArrowRight size={16} className="text-white" />,
							}}
						/>
					)}

					{step === 3 && (
						<Button
							onClick={handleShowSummary}
							theme="default"
							text="Create"
							icon={{
								position: 'left',
								content: <Plus size={16} className="text-white" />,
							}}
						/>
					)}
				</div>
			</div>

			{/* Summary Modal */}
			{showSummaryModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="sticky top-0 bg-slate-900 text-white p-6 flex justify-between items-center">
							<button onClick={() => setShowSummaryModal(false)} className="text-white hover:bg-slate-800 rounded-lg p-2 transition-colors">
								✕
							</button>
						</div>

						<div className="p-6 space-y-6">
							{/* Step 1: Employee Details */}
							<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
								<h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
									<IdCard size={20} className="text-slate-700" />
									Employee Details
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">First Name</p>
										<p className="text-slate-900 font-medium">{employeeDetails.first_name || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Middle Name</p>
										<p className="text-slate-900 font-medium">{employeeDetails.middle_name || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Last Name</p>
										<p className="text-slate-900 font-medium">{employeeDetails.last_name || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
										<p className="text-slate-900 font-medium">{employeeDetails.email || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Contact No.</p>
										<p className="text-slate-900 font-medium">{employeeDetails.contact_no || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Citizenship</p>
										<p className="text-slate-900 font-medium">{employeeDetails.citizenship || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Civil Status</p>
										<p className="text-slate-900 font-medium">{employeeDetails.civil_status || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Religion</p>
										<p className="text-slate-900 font-medium">{employeeDetails.religion || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Birth Date</p>
										<p className="text-slate-900 font-medium">{employeeDetails.birth_date || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Birth Place</p>
										<p className="text-slate-900 font-medium">{employeeDetails.birth_place || '—'}</p>
									</div>
									<div className="bg-white p-3 rounded-lg border border-slate-200">
										<p className="text-xs text-slate-500 uppercase tracking-wide">Hire Date</p>
										<p className="text-slate-900 font-medium">{employeeDetails.hire_date || '—'}</p>
									</div>
								</div>
							</div>

							{/* Step 2: Relatives */}
							<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
								<h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
									<Users size={20} className="text-slate-700" />
									Relatives ({relatives.length})
								</h3>
								{relatives.length === 0 ? (
									<p className="text-slate-500 text-sm">No relatives added</p>
								) : (
									<div className="space-y-3">
										{relatives.map((relative, index) => (
											<div key={index} className="bg-white p-4 rounded-lg border border-slate-200">
												<p className="font-semibold text-slate-900 mb-2">
													{relative.first_name} {relative.middle_name} {relative.last_name}
												</p>
												<div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
													<div>
														<p className="text-slate-500">Relationship</p>
														<p className="text-slate-900 font-medium">{relative.relationship || '—'}</p>
													</div>
													<div>
														<p className="text-slate-500">Contact</p>
														<p className="text-slate-900 font-medium">{relative.contact_no || '—'}</p>
													</div>
													<div>
														<p className="text-slate-500">Occupation</p>
														<p className="text-slate-900 font-medium">{relative.occupation || '—'}</p>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Step 3: Statutory Benefits */}
							<div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
								<h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
									<Grid2x2 size={20} className="text-slate-700" />
									Statutory Benefits
								</h3>
								{Object.values(selectedBenefits).every((val) => !val) ? (
									<p className="text-slate-500 text-sm">No benefits selected</p>
								) : (
									<div className="space-y-4">
										{selectedBenefits.hasSalary && (
											<div className="bg-white p-4 rounded-lg border border-slate-200">
												<p className="font-medium text-slate-900 mb-2">Salary History</p>
												<p className="text-slate-600">
													Amount: <span className="font-semibold text-slate-900">₱{salaryHistory.amount.toLocaleString()}</span>
												</p>
											</div>
										)}
										{selectedBenefits.hasSSS && (
											<div className="bg-white p-4 rounded-lg border border-slate-200">
												<p className="font-medium text-slate-900 mb-2">SSS Settings</p>
												<div className="grid grid-cols-3 gap-2 text-sm">
													<div>
														<p className="text-slate-500">SSS No.</p>
														<p className="text-slate-900 font-medium">{sssSettings.sss_no || '—'}</p>
													</div>
												</div>
											</div>
										)}
										{selectedBenefits.hasPhilHealth && (
											<div className="bg-white p-4 rounded-lg border border-slate-200">
												<p className="font-medium text-slate-900 mb-2">PhilHealth</p>
												<div className="grid grid-cols-2 gap-2 text-sm">
													<div>
														<p className="text-slate-500">PhilHealth No.</p>
														<p className="text-slate-900 font-medium">{philhealthSettings.philhealth_no || '—'}</p>
													</div>
												</div>
											</div>
										)}
										{selectedBenefits.hasPagIBIG && (
											<div className="bg-white p-4 rounded-lg border border-slate-200">
												<p className="font-medium text-slate-900 mb-2">Pag-IBIG</p>
												<div className="grid grid-cols-2 gap-2 text-sm">
													<div>
														<p className="text-slate-500">Pag-IBIG No.</p>
														<p className="text-slate-900 font-medium">{pagibigSettings.pagibig_no || '—'}</p>
													</div>
													<div>
														<p className="text-slate-500">EE Share Rate</p>
														<p className="text-slate-900 font-medium">{pagibigSettings.ee_share_rate}%</p>
													</div>
												</div>
											</div>
										)}
										{selectedBenefits.hasBIR && (
											<div className="bg-white p-4 rounded-lg border border-slate-200">
												<p className="font-medium text-slate-900 mb-2">BIR (TIN)</p>
												<div className="grid grid-cols-2 gap-2 text-sm">
													<div>
														<p className="text-slate-500">TIN No.</p>
														<p className="text-slate-900 font-medium">{birSettings.tin_no || '—'}</p>
													</div>
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						{/* Modal Actions */}
						<div className="sticky bottom-0 bg-slate-100 p-6 flex justify-end gap-3 border-t border-slate-200">
							<Button onClick={() => setShowSummaryModal(false)} theme="outline" text="Cancel" />
							<Button
								onClick={handleConfirmCreate}
								theme="default"
								text="Confirm & Create"
								icon={{
									position: 'left',
									content: <Plus size={16} className="text-white" />,
								}}
							/>
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

			{validationModal.isOpen && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
						<div className="flex items-center gap-3 mb-4">
							<XCircle className="w-6 h-6 text-amber-600" />
							<h3 className="text-lg font-bold text-slate-800">{validationModal.title}</h3>
						</div>
						<p className="text-slate-600">{validationModal.message}</p>
						{validationModal.items.length > 0 && (
							<ul className="mt-3 list-disc list-inside text-sm text-slate-700 space-y-1">
								{validationModal.items.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						)}
						<button
							onClick={() =>
								setValidationModal({
									isOpen: false,
									title: 'Incomplete Details',
									message: 'Please complete the required fields before continuing.',
									items: [],
								})
							}
							className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
						>
							Close
						</button>
					</div>
				</div>
			)}

			<LoadingModal open={create_employee_mutation.isPending} message="Creating employee, please wait..." />
		</main>
	);
};

export default CreateEmployee;
