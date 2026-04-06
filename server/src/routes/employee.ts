import express, { Request, Response, Router } from 'express';
import { prisma } from '../config/prisma';
import { PAG_IBIG_RATES, PHILHEALTH_RATE, SSS_CONTRIBUTION_RATES } from '../lib/benefits_contribution';
import { checkAuth } from './auth';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const router: Router = express.Router();

type TEmployeeRelative = {
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
};

type TSalaryHistory = {
	employee_id?: number;
	amount: number;
};

type TSSSSettings = {
	employee_id?: number;
	ee_share: number;
	sss_no: string;
};
type TPhilhealthSettings = {
	employee_id?: number;
	ee_share: number;
	philhealth_no: string;
};
type TPagIBIGSettings = {
	employee_id?: number;
	ee_share: number;
	pagibig_no: string;
};
type TBIRSettings = {
	employee_id?: number;
	tin_no: string;
};

type TEmployee = {
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
};

type TPayrollLogsBenefits = {
	id: number;
	payroll_logs_id: number;
	benefit_title: string;
	benefit_key: string;
	amount: number;
	created_at: Date;
	updated_at: Date;
};

type TPayrollLogs = {
	id: number;
	employee_id: number;
	title: string;
	gross_pay: number;
	net_pay: number;
	created_at: Date;
	updated_at: Date;
	benefits: TPayrollLogsBenefits[];
};

router.get('/', checkAuth, async (req: Request, res: Response) => {
	const status = req.query.status as string | undefined;

	try {
		const employees = await prisma.employee.findMany({
			select: {
				id: true,
				first_name: true,
				middle_name: true,
				last_name: true,
				contact_no: true,
				email: true,
				civil_status: true,
				birth_date: true,
				salary_history: true,
				payroll_logs: {
					select: {
						benefits: {
							select: {
								benefit_key: true,
							},
						},
					},
				},
			},
			where: {
				...(status && { status }),
			},
		});

		const payload = employees.map((employee) => {
			// Collect all benefits from all payroll logs
			const allBenefits = employee.payroll_logs.flatMap((log) => log.benefits);

			// Count each benefit type
			const no_sss_contributions = allBenefits.filter((b) => b.benefit_key === 'sss').length;
			const no_philhealth_contributions = allBenefits.filter((b) => b.benefit_key === 'philhealth').length;
			const no_pagibig_contributions = allBenefits.filter((b) => b.benefit_key === 'pagibig').length;

			const salaryHistory = employee.salary_history ?? [];
			const salary = salaryHistory.length > 0 ? (salaryHistory[0]?.amount ?? 0) : 0;

			return {
				id: employee.id,
				first_name: employee.first_name,
				middle_name: employee.middle_name,
				last_name: employee.last_name,
				contact_no: employee.contact_no,
				email: employee.email,
				civil_status: employee.civil_status,
				birth_date: employee.birth_date,
				salary,
				no_sss_contributions,
				no_philhealth_contributions,
				no_pagibig_contributions,
			};
		});

		return res.status(200).json(payload);
	} catch (error) {
		console.error('Error fetching employees:', error);
		return res.status(500).json({ message: 'An error occurred while fetching employees.' });
	}
});

router.get('/payroll', checkAuth, async (req: Request, res: Response) => {
	const status = req.query.status as string | undefined;

	const sss = req.query.sss as string | undefined;
	const philhealth = req.query.philhealth as string | undefined;
	const pagibig = req.query.pagibig as string | undefined;

	const pay_period = req.query.pay_period as string | undefined;
	const yearParam = req.query.year as string | undefined;
	const monthsParam = req.query.months as string | string[] | undefined;

	const parsedYear = yearParam ? Number(yearParam) : undefined;

	const monthValues = Array.isArray(monthsParam)
		? monthsParam
		: monthsParam
			? monthsParam
					.split(',')
					.map((month) => month.trim())
					.filter(Boolean)
			: [];
	const monthNamesFilter = monthValues.map((month) => monthNames[Number.parseInt(month, 10) - 1]).filter((name): name is string => Boolean(name));

	const selectedBenefitKeys = [
		{ key: 'sss', enabled: sss === 'true' },
		{ key: 'philhealth', enabled: philhealth === 'true' },
		{ key: 'pagibig', enabled: pagibig === 'true' },
	]
		.filter((benefit) => benefit.enabled)
		.map((benefit) => benefit.key);

	const shouldCheckPaidBenefits = pay_period !== 'half' && Boolean(parsedYear) && monthNamesFilter.length > 0 && selectedBenefitKeys.length > 0;

	const payrollLogsSelect = {
		where: shouldCheckPaidBenefits
			? {
					payroll_year: parsedYear as number,
					payroll_month: { in: monthNamesFilter },
					...(pay_period && { pay_period }),
				}
			: { id: -1 },
		select: {
			payroll_month: true,
			benefits: {
				select: {
					benefit_key: true,
				},
			},
		},
	};

	try {
		const employees = await prisma.employee.findMany({
			select: {
				id: true,
				first_name: true,
				middle_name: true,
				last_name: true,
				salary_history: true,
				sss_settings: true,
				philhealth_settings: true,
				pagibig_settings: true,
				bir_settings: true,
				payroll_logs: payrollLogsSelect,
			},
			where: {
				...(status && { status }),
			},
		});

		const employer_share = await prisma.employerShare.findFirst();

		const payload = employees
			.filter((employee) => {
				if (sss === 'true' && !employee.sss_settings) return false;
				if (philhealth === 'true' && !employee.philhealth_settings) return false;
				if (pagibig === 'true' && !employee.pagibig_settings) return false;
				if (!shouldCheckPaidBenefits || !employee.payroll_logs) return true;

				const monthBenefits = new Map<string, Set<string>>();

				employee.payroll_logs.forEach((log) => {
					const benefitSet = monthBenefits.get(log.payroll_month) ?? new Set<string>();
					log.benefits.forEach((benefit) => benefitSet.add(benefit.benefit_key));
					monthBenefits.set(log.payroll_month, benefitSet);
				});

				const isFullyPaidForSelection = monthNamesFilter.every((monthName) => {
					const benefitSet = monthBenefits.get(monthName);
					return benefitSet ? selectedBenefitKeys.every((key) => benefitSet.has(key)) : false;
				});

				return !isFullyPaidForSelection;
			})
			.map((employee) => {
				const { payroll_logs: _payrollLogs, ...rest } = employee;
				const salaryHistory = employee.salary_history ?? [];
				const salary = salaryHistory.length > 0 ? (salaryHistory[0]?.amount ?? 0) : 0;

				const sss_contribution = SSS_CONTRIBUTION_RATES(salary);

				const philhealth_contribution = {
					total: (salary * ((employer_share?.philhealth_share ?? 0) + (employee.philhealth_settings?.ee_share ?? 0))) / 100,
					rate: (employer_share?.philhealth_share ?? 0) + (employee.philhealth_settings?.ee_share ?? 0),
				};
				const pagibig_contribution = {
					total: (employer_share?.pagibig_share ?? 0) + (employee.pagibig_settings?.ee_share ?? 0),
					rate: (employer_share?.pagibig_share ?? 0) + (employee.pagibig_settings?.ee_share ?? 0),
				};

				return {
					...rest,
					salary: salary,
					sss_settings: employee.sss_settings ? { ...employee.sss_settings, ...sss_contribution } : null,
					philhealth_settings: employee.philhealth_settings ? { ...employee.philhealth_settings, contribution: philhealth_contribution } : null,
					pagibig_settings: employee.pagibig_settings ? { ...employee.pagibig_settings, contribution: pagibig_contribution } : null,
				};
			});

		return res.status(200).json(payload);
	} catch (error) {
		console.error('Error fetching employees for payroll:', error);
		return res.status(500).json({ message: 'An error occurred while fetching employees for payroll.' });
	}
});

router.post('/payroll', checkAuth, async (req: Request, res: Response) => {
	const employeess = req.body.employee as
		| {
				id: number;
				gross: number;
				net: number;
				deductions: number;
				applied_benefits: {
					benefit_key: string;
					amount: number;
				}[];
		  }[]
		| undefined;
	const months = req.body.months as string[] | undefined;
	const year = req.body.year as number | undefined;
	const pay_period = req.body.pay_period as string | undefined;

	if (!employeess || employeess.length === 0) {
		return res.status(400).json({ message: 'No employees provided.' });
	}

	if (!months || months.length === 0) {
		return res.status(400).json({ message: 'No months provided.' });
	}

	if (!year) {
		return res.status(400).json({ message: 'No year provided.' });
	}

	if (!pay_period) {
		return res.status(400).json({ message: 'No pay period provided.' });
	}

	const pay = months?.map((month) => {
		const monthIndex = parseInt(month) - 1;

		const monthName = monthNames[monthIndex] || 'Unknown';

		const payrollLogsData = employeess.map((employee) => ({
			employee_id: employee.id,
			title: `Payroll for ${monthName} ${year} - ${pay_period}`,
			gross_pay: employee.gross,
			net_pay: employee.net,
			payroll_month: monthName,
			payroll_year: year,
			pay_period,
			process_at: new Date(),
			...(employee.applied_benefits?.length
				? {
						benefits: {
							createMany: {
								data: employee.applied_benefits.map((benefit) => ({
									benefit_key: benefit.benefit_key,
									amount: benefit.amount,
									benefit_title: benefit.benefit_key,
								})),
							},
						},
					}
				: {}),
		}));
		return payrollLogsData;
	});

	try {
		await prisma.$transaction(
			pay.flat().map((log) =>
				prisma.payrollLogs.create({
					data: log,
				}),
			),
		);
		return res.status(200).json({ message: 'Payroll processed successfully.' });
	} catch (error) {
		console.error('Error processing payroll:', error);
		return res.status(500).json({ message: 'An error occurred while processing payroll.' });
	}
});

router.get('/:id', checkAuth, async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const employee = await prisma.employee.findUnique({
			where: { id: Number(id) },
			include: {
				relatives: true,
				salary_history: { orderBy: { created_at: 'desc' } },
				sss_settings: true,
				philhealth_settings: true,
				pagibig_settings: true,
				bir_settings: true,
				payroll_logs: {
					select: {
						gross_pay: true,
						net_pay: true,
						title: true,
						payroll_month: true,
						payroll_year: true,
						process_at: true,
						benefits: {
							select: {
								benefit_key: true,
								amount: true,
							},
						},
					},
				},
			},
		});

		if (!employee) {
			return res.status(404).json({ message: 'Employee not found.' });
		}

		const employer_share = await prisma.employerShare.findFirst();

		const current_salary = (employee.salary_history ?? []).length > 0 ? ((employee.salary_history ?? [])[0]?.amount ?? 0) : 0;

		const sss_contribution = SSS_CONTRIBUTION_RATES(current_salary);

		// const philhealth_contribution = PHILHEALTH_RATE(current_salary);
		const philhealth_contribution = {
			total: (current_salary * ((employer_share?.philhealth_share ?? 0) + (employee.philhealth_settings?.ee_share ?? 0))) / 100,
			rate: (employer_share?.philhealth_share ?? 0) + (employee.philhealth_settings?.ee_share ?? 0),
		};

		// const pagibig_contribution = PAG_IBIG_RATES(current_salary);
		const pagibig_contribution = {
			total: (employer_share?.pagibig_share ?? 0) + (employee.pagibig_settings?.ee_share ?? 0),
		};

		const allBenefits = employee.payroll_logs.flatMap((log) => log.benefits);

		const no_sss_contributions = allBenefits.filter((b) => b.benefit_key === 'sss').length;
		const no_philhealth_contributions = allBenefits.filter((b) => b.benefit_key === 'philhealth').length;
		const no_pagibig_contributions = allBenefits.filter((b) => b.benefit_key === 'pagibig').length;

		const payload = {
			...employee,

			sss_settings: employee.sss_settings ? { ...employee.sss_settings, ...sss_contribution, no_sss_contributions } : null,
			philhealth_settings: employee.philhealth_settings ? { ...employee.philhealth_settings, contribution: philhealth_contribution, no_philhealth_contributions } : null,
			pagibig_settings: employee.pagibig_settings ? { ...employee.pagibig_settings, contribution: pagibig_contribution, no_pagibig_contributions } : null,
		};

		return res.status(200).json(payload);
	} catch (error) {
		console.error('Error fetching employee:', error);
		return res.status(500).json({ message: 'An error occurred while fetching the employee.' });
	}
});

router.post('/', checkAuth, async (req: Request, res: Response) => {
	const body = req.body as TEmployee & {
		relatives: TEmployeeRelative[];
		salary?: TSalaryHistory;
		sss_settings?: TSSSSettings;
		philhealth_settings?: TPhilhealthSettings;
		pagibig_settings?: TPagIBIGSettings;
		bir_settings?: TBIRSettings;
	};

	console.log(body);

	try {
		const employee = await prisma.employee.create({
			data: {
				first_name: body.first_name,
				middle_name: body.middle_name,
				last_name: body.last_name,
				email: body.email,
				contact_no: body.contact_no,
				birth_place: body.birth_place,
				birth_date: new Date(body.birth_date),
				religion: body.religion,
				citizenship: body.citizenship,
				civil_status: body.civil_status,
				relatives: {
					createMany: {
						data: body.relatives.map((relative) => ({
							first_name: relative.first_name,
							middle_name: relative.middle_name,
							last_name: relative.last_name,
							relationship: relative.relationship,
							contact_no: relative.contact_no,
							address: relative.address,
							occupation: relative.occupation,
							birth_date: new Date(relative.birth_date),
							birth_place: relative.birth_place,
						})),
					},
				},
				...(body.salary && {
					salary_history: {
						createMany: {
							data: {
								amount: body.salary?.amount || 0,
							},
						},
					},
				}),
				...(body.sss_settings && {
					sss_settings: {
						create: {
							sss_no: body.sss_settings.sss_no,
						},
					},
				}),
				...(body.philhealth_settings && {
					philhealth_settings: {
						create: {
							philhealth_no: body.philhealth_settings.philhealth_no,
						},
					},
				}),
				...(body.pagibig_settings && {
					pagibig_settings: {
						create: {
							pagibig_no: body.pagibig_settings.pagibig_no,
						},
					},
				}),
				...(body.bir_settings && {
					bir_settings: {
						create: {
							tin_no: body.bir_settings.tin_no,
						},
					},
				}),
			},
			include: {
				relatives: true,
				salary_history: true,
				sss_settings: true,
				philhealth_settings: true,
				pagibig_settings: true,
				bir_settings: true,
			},
		});

		return res.status(201).json(employee);
	} catch (error) {
		console.error('Error creating employee:', error);
		return res.status(500).json({ message: 'An error occurred while creating the employee.' });
	}
});

router.put('/:id', checkAuth, async (req: Request, res: Response) => {
	const { type } = req.query;
	const { id } = req.params;
	const body = req.body;

	if (type === 'personal_info') {
		try {
			const updatedEmployee = await prisma.employee.update({
				where: { id: Number(id) },
				data: {
					first_name: body.first_name,
					middle_name: body.middle_name,
					last_name: body.last_name,
					email: body.email,
					contact_no: body.contact_no,
					birth_place: body.birth_place,
					birth_date: new Date(body.birth_date),
					religion: body.religion,
					citizenship: body.citizenship,
					civil_status: body.civil_status,
				},
			});

			return res.status(200).json(updatedEmployee);
		} catch (error) {
			console.error('Error updating employee:', error);
			return res.status(500).json({ message: 'An error occurred while updating the employee.' });
		}
	}

	if (type === 'contact_info') {
		try {
			const updatedEmployee = await prisma.employee.update({
				where: { id: Number(id) },
				data: {
					email: body.email,
					contact_no: body.contact_no,
				},
			});

			return res.status(200).json(updatedEmployee);
		} catch (error) {
			console.error('Error updating contact info:', error);
			return res.status(500).json({ message: 'An error occurred while updating contact info.' });
		}
	}

	if (type === 'relatives') {
		try {
			const { relatives } = body as { relatives: TEmployeeRelative[] };

			// Delete existing relatives
			await prisma.employeeRelative.deleteMany({
				where: { employee_id: Number(id) },
			});

			// Create new relatives
			await prisma.employeeRelative.createMany({
				data: relatives.map((relative) => ({
					employee_id: Number(id),
					first_name: relative.first_name,
					middle_name: relative.middle_name,
					last_name: relative.last_name,
					relationship: relative.relationship,
					contact_no: relative.contact_no,
					address: relative.address,
					occupation: relative.occupation,
					birth_date: new Date(relative.birth_date),
					birth_place: relative.birth_place,
				})),
			});

			return res.status(200).json({ message: 'Relatives updated successfully.' });
		} catch (error) {
			console.error('Error updating relatives:', error);
			return res.status(500).json({ message: 'An error occurred while updating relatives.' });
		}
	}

	if (type === 'salary') {
		try {
			const { salary } = body as { salary: TSalaryHistory };

			// Create new salary history entry
			await prisma.salaryHistory.create({
				data: {
					employee_id: Number(id),
					amount: salary.amount,
				},
			});

			return res.status(200).json({ message: 'Salary history updated successfully.' });
		} catch (error) {
			console.error('Error updating salary history:', error);
			return res.status(500).json({ message: 'An error occurred while updating salary history.' });
		}
	}

	if (type === 'sss_settings' || type === 'philhealth_settings' || type === 'pagibig_settings' || type === 'bir_settings') {
		if (type === 'sss_settings') {
			const sssBody = body as TSSSSettings;
			try {
				const existingSettings = await prisma.sSSSettings.findUnique({
					where: { employee_id: Number(id) },
				});

				if (existingSettings) {
					// Update existing settings
					const updatedSettings = await prisma.sSSSettings.update({
						where: { employee_id: Number(id) },
						data: {
							sss_no: sssBody.sss_no,
							ee_share: sssBody.ee_share,
						},
					});
					return res.status(200).json(updatedSettings);
				} else {
					// Create new settings
					const newSettings = await prisma.sSSSettings.create({
						data: {
							employee_id: Number(id),
							sss_no: sssBody.sss_no,
							ee_share: sssBody.ee_share,
						},
					});
					return res.status(201).json(newSettings);
				}
			} catch (error) {
				console.error('Error updating/creating SSS settings:', error);
				return res.status(500).json({ message: 'An error occurred while updating/creating SSS settings.' });
			}
		}

		if (type === 'philhealth_settings') {
			const philhealthBody = body as TPhilhealthSettings;
			try {
				const existingSettings = await prisma.philhealthSettings.findUnique({
					where: { employee_id: Number(id) },
				});

				if (existingSettings) {
					// Update existing settings
					const updatedSettings = await prisma.philhealthSettings.update({
						where: { employee_id: Number(id) },
						data: {
							philhealth_no: philhealthBody.philhealth_no,
							ee_share: philhealthBody.ee_share,
						},
					});
					return res.status(200).json(updatedSettings);
				} else {
					// Create new settings
					const newSettings = await prisma.philhealthSettings.create({
						data: {
							employee_id: Number(id),
							philhealth_no: philhealthBody.philhealth_no,
							ee_share: philhealthBody.ee_share,
						},
					});
					return res.status(201).json(newSettings);
				}
			} catch (error) {
				console.error('Error updating/creating PhilHealth settings:', error);
				return res.status(500).json({ message: 'An error occurred while updating/creating PhilHealth settings.' });
			}
		}

		if (type === 'pagibig_settings') {
			const pagibigBody = body as TPagIBIGSettings;
			try {
				const existingSettings = await prisma.pagIBIGSettings.findUnique({
					where: { employee_id: Number(id) },
				});

				if (existingSettings) {
					// Update existing settings
					const updatedSettings = await prisma.pagIBIGSettings.update({
						where: { employee_id: Number(id) },
						data: {
							pagibig_no: pagibigBody.pagibig_no,
							ee_share: pagibigBody.ee_share,
						},
					});
					return res.status(200).json(updatedSettings);
				} else {
					// Create new settings
					const newSettings = await prisma.pagIBIGSettings.create({
						data: {
							employee_id: Number(id),
							pagibig_no: pagibigBody.pagibig_no,
							ee_share: pagibigBody.ee_share,
						},
					});
					return res.status(201).json(newSettings);
				}
			} catch (error) {
				console.error('Error updating/creating Pag-IBIG settings:', error);
				return res.status(500).json({ message: 'An error occurred while updating/creating Pag-IBIG settings.' });
			}
		}

		if (type === 'bir_settings') {
			const birBody = body as TBIRSettings;
			try {
				const existingSettings = await prisma.bIRSettings.findUnique({
					where: { employee_id: Number(id) },
				});

				if (existingSettings) {
					// Update existing settings
					const updatedSettings = await prisma.bIRSettings.update({
						where: { employee_id: Number(id) },
						data: {
							tin_no: birBody.tin_no,
						},
					});
					return res.status(200).json(updatedSettings);
				} else {
					// Create new settings
					const newSettings = await prisma.bIRSettings.create({
						data: {
							employee_id: Number(id),
							tin_no: birBody.tin_no,
						},
					});
					return res.status(201).json(newSettings);
				}
			} catch (error) {
				console.error('Error updating/creating BIR settings:', error);
				return res.status(500).json({ message: 'An error occurred while updating/creating BIR settings.' });
			}
		}
		// This will be handled by their respective endpoints
		return res.status(400).json({ message: 'Please use the specific endpoint for updating this type of settings.' });
	}

	if (type === 'archive') {
		try {
			const archivedEmployee = await prisma.employee.update({
				where: { id: Number(id) },
				data: {
					status: 'ARCHIVED',
				},
			});
			return res.status(200).json(archivedEmployee);
		} catch (error) {
			console.error('Error archiving employee:', error);
			return res.status(500).json({ message: 'An error occurred while archiving the employee.' });
		}
	}

	if (type === 'activate') {
		try {
			const activatedEmployee = await prisma.employee.update({
				where: { id: Number(id) },
				data: {
					status: 'ACTIVE',
				},
			});
			return res.status(200).json(activatedEmployee);
		} catch (error) {
			console.error('Error activating employee:', error);
			return res.status(500).json({ message: 'An error occurred while activating the employee.' });
		}
	}

	return res.status(400).json({ message: 'Invalid update type specified.' });
});

router.post('/:id/pagibig', checkAuth, async (req: Request, res: Response) => {
	const { id } = req.params;
	const body = req.body as TPagIBIGSettings;

	try {
		const existingSettings = await prisma.pagIBIGSettings.findUnique({
			where: { employee_id: Number(id) },
		});

		if (existingSettings) {
			// Update existing settings
			const updatedSettings = await prisma.pagIBIGSettings.update({
				where: { employee_id: Number(id) },
				data: {
					pagibig_no: body.pagibig_no,
				},
			});
			return res.status(200).json(updatedSettings);
		} else {
			// Create new settings
			const newSettings = await prisma.pagIBIGSettings.create({
				data: {
					employee_id: Number(id),
					pagibig_no: body.pagibig_no,
				},
			});
			return res.status(201).json(newSettings);
		}
	} catch (error) {
		console.error('Error updating/creating Pag-IBIG settings:', error);
		return res.status(500).json({ message: 'An error occurred while updating/creating Pag-IBIG settings.' });
	}
});

router.post('/:id/sss', checkAuth, async (req: Request, res: Response) => {
	const { id } = req.params;
	const body = req.body as TSSSSettings;

	try {
		const existingSettings = await prisma.sSSSettings.findUnique({
			where: { employee_id: Number(id) },
		});

		if (existingSettings) {
			// Update existing settings
			const updatedSettings = await prisma.sSSSettings.update({
				where: { employee_id: Number(id) },
				data: {
					sss_no: body.sss_no,
				},
			});
			return res.status(200).json(updatedSettings);
		} else {
			// Create new settings
			const newSettings = await prisma.sSSSettings.create({
				data: {
					employee_id: Number(id),
					sss_no: body.sss_no,
				},
			});
			return res.status(201).json(newSettings);
		}
	} catch (error) {
		console.error('Error updating/creating SSS settings:', error);
		return res.status(500).json({ message: 'An error occurred while updating/creating SSS settings.' });
	}
});

router.post('/:id/philhealth', checkAuth, async (req: Request, res: Response) => {
	const { id } = req.params;
	const body = req.body as TPhilhealthSettings;

	try {
		const existingSettings = await prisma.philhealthSettings.findUnique({
			where: { employee_id: Number(id) },
		});

		if (existingSettings) {
			// Update existing settings
			const updatedSettings = await prisma.philhealthSettings.update({
				where: { employee_id: Number(id) },
				data: {
					philhealth_no: body.philhealth_no,
				},
			});
			return res.status(200).json(updatedSettings);
		} else {
			// Create new settings
			const newSettings = await prisma.philhealthSettings.create({
				data: {
					employee_id: Number(id),
					philhealth_no: body.philhealth_no,
				},
			});
			return res.status(201).json(newSettings);
		}
	} catch (error) {
		console.error('Error updating/creating PhilHealth settings:', error);
		return res.status(500).json({ message: 'An error occurred while updating/creating PhilHealth settings.' });
	}
});

router.post('/:id/bir', checkAuth, async (req: Request, res: Response) => {
	const { id } = req.params;
	const body = req.body as TBIRSettings;

	try {
		const existingSettings = await prisma.bIRSettings.findUnique({
			where: { employee_id: Number(id) },
		});

		if (existingSettings) {
			// Update existing settings
			const updatedSettings = await prisma.bIRSettings.update({
				where: { employee_id: Number(id) },
				data: {
					tin_no: body.tin_no,
				},
			});
			return res.status(200).json(updatedSettings);
		} else {
			// Create new settings
			const newSettings = await prisma.bIRSettings.create({
				data: {
					employee_id: Number(id),
					tin_no: body.tin_no,
				},
			});
			return res.status(201).json(newSettings);
		}
	} catch (error) {
		console.error('Error updating/creating BIR settings:', error);
		return res.status(500).json({ message: 'An error occurred while updating/creating BIR settings.' });
	}
});

router.delete('/:id', checkAuth, async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		await prisma.employee.delete({
			where: { id: Number(id) },
			include: {
				payroll_logs: {
					include: {
						benefits: true,
					},
				},
				relatives: true,
				salary_history: true,
				sss_settings: true,
				philhealth_settings: true,
				pagibig_settings: true,
				bir_settings: true,
			},
		});
		return res.status(200).json({ message: 'Employee deleted successfully.' });
	} catch (error) {
		console.error('Error deleting employee:', error);
		return res.status(500).json({ message: 'An error occurred while deleting the employee.' });
	}
});

export default router;
