import express, { Router, Response, Request } from 'express';
import { prisma } from '../config/prisma';

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
	sss_no: string;
	ee_share_rate: number;
	mpf_amount: number;
};
type TPhilhealthSettings = {
	employee_id?: number;
	philhealth_no: string;
	ee_share_rate: number;
};
type TPagIBIGSettings = {
	employee_id?: number;
	pagibig_no: string;
	ee_share_rate: number;
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

router.get('/', async (req: Request, res: Response) => {
	try {
		const employees = await prisma.employee.findMany({
			select: {
				id: true,
				first_name: true,
				middle_name: true,
				last_name: true,
				contact_no: true,
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
		});

		const payload = employees.map((employee) => {
			// Collect all benefits from all payroll logs
			const allBenefits = employee.payroll_logs.flatMap((log) => log.benefits);

			// Count each benefit type
			const no_sss_contributions = allBenefits.filter((b) => b.benefit_key === 'sss').length;
			const no_philhealth_contributions = allBenefits.filter((b) => b.benefit_key === 'philhealth').length;
			const no_pagibig_contributions = allBenefits.filter((b) => b.benefit_key === 'pagibig').length;
			const no_bir_contributions = allBenefits.filter((b) => b.benefit_key === 'bir').length;

			return {
				id: employee.id,
				first_name: employee.first_name,
				middle_name: employee.middle_name,
				last_name: employee.last_name,

				no_sss_contributions,
				no_philhealth_contributions,
				no_pagibig_contributions,
				no_bir_contributions,
			};
		});

		return res.status(200).json(payload);
	} catch (error) {
		console.error('Error fetching employees:', error);
		return res.status(500).json({ message: 'An error occurred while fetching employees.' });
	}
});

router.get('/:id', async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const employee = await prisma.employee.findUnique({
			where: { id: Number(id) },
			include: {
				relatives: true,
				salary_history: true,
				sss_settings: true,
				philhealth_settings: true,
				pagibig_settings: true,
				bir_settings: true,
			},
		});

		if (!employee) {
			return res.status(404).json({ message: 'Employee not found.' });
		}

		return res.status(200).json(employee);
	} catch (error) {
		console.error('Error fetching employee:', error);
		return res.status(500).json({ message: 'An error occurred while fetching the employee.' });
	}
});

router.post('/', async (req: Request, res: Response) => {
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
							ee_share_rate: body.sss_settings.ee_share_rate,
							sss_no: body.sss_settings.sss_no,
							mpf_amount: body.sss_settings.mpf_amount,
						},
					},
				}),
				...(body.philhealth_settings && {
					philhealth_settings: {
						create: {
							philhealth_no: body.philhealth_settings.philhealth_no,
							ee_share_rate: body.philhealth_settings.ee_share_rate,
						},
					},
				}),
				...(body.pagibig_settings && {
					pagibig_settings: {
						create: {
							pagibig_no: body.pagibig_settings.pagibig_no,
							ee_share_rate: body.pagibig_settings.ee_share_rate,
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

router.put('/:id', async (req: Request, res: Response) => {
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

	return res.status(400).json({ message: 'Invalid update type specified.' });
});

router.post('/:id/pagibig', async (req: Request, res: Response) => {
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
					ee_share_rate: body.ee_share_rate,
				},
			});
			return res.status(200).json(updatedSettings);
		} else {
			// Create new settings
			const newSettings = await prisma.pagIBIGSettings.create({
				data: {
					employee_id: Number(id),
					pagibig_no: body.pagibig_no,
					ee_share_rate: body.ee_share_rate,
				},
			});
			return res.status(201).json(newSettings);
		}
	} catch (error) {
		console.error('Error updating/creating Pag-IBIG settings:', error);
		return res.status(500).json({ message: 'An error occurred while updating/creating Pag-IBIG settings.' });
	}
});

router.post('/:id/sss', async (req: Request, res: Response) => {
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
					ee_share_rate: body.ee_share_rate,
					mpf_amount: body.mpf_amount,
				},
			});
			return res.status(200).json(updatedSettings);
		} else {
			// Create new settings
			const newSettings = await prisma.sSSSettings.create({
				data: {
					employee_id: Number(id),
					sss_no: body.sss_no,
					ee_share_rate: body.ee_share_rate,
					mpf_amount: body.mpf_amount,
				},
			});
			return res.status(201).json(newSettings);
		}
	} catch (error) {
		console.error('Error updating/creating SSS settings:', error);
		return res.status(500).json({ message: 'An error occurred while updating/creating SSS settings.' });
	}
});

router.post('/:id/philhealth', async (req: Request, res: Response) => {
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
					ee_share_rate: body.ee_share_rate,
				},
			});
			return res.status(200).json(updatedSettings);
		} else {
			// Create new settings
			const newSettings = await prisma.philhealthSettings.create({
				data: {
					employee_id: Number(id),
					philhealth_no: body.philhealth_no,
					ee_share_rate: body.ee_share_rate,
				},
			});
			return res.status(201).json(newSettings);
		}
	} catch (error) {
		console.error('Error updating/creating PhilHealth settings:', error);
		return res.status(500).json({ message: 'An error occurred while updating/creating PhilHealth settings.' });
	}
});

router.post('/:id/bir', async (req: Request, res: Response) => {
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

export default router;
