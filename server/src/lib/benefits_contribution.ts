import { prisma } from '../config/prisma';
import { generateSSS2025TableSet } from './sss_table_2025';

type PagIBIGRates = {
	employer_rate: number;
	employee_rate: number;
	total_rate: number;
	total?: number;
};

export const SSS_EMPLOYER_RATE = 10;
export const SSS_EMPLOYEE_RATE = 5;
export const PHILHEALTH_RATE_PERCENTAGE = 5;

export const PAG_IBIG_RATES = (salary: number): PagIBIGRates => {
	let ee_rate = 0;
	let er_rate = 0;

	if (salary <= 1500) {
		ee_rate = 1;
		er_rate = 2;

		return {
			employer_rate: er_rate,
			employee_rate: ee_rate,
			total_rate: ee_rate + er_rate,
			total: salary * ((ee_rate + er_rate) / 100),
		};
	}

	ee_rate = 2;
	er_rate = 2;

	return {
		employer_rate: er_rate,
		employee_rate: ee_rate,
		total_rate: ee_rate + er_rate,
		total: salary * ((ee_rate + er_rate) / 100),
	};
};

export const PHILHEALTH_RATE = (salary: number) => {
	const contribution = salary * (PHILHEALTH_RATE_PERCENTAGE / 100);
	return {
		total: contribution,
		rate: PHILHEALTH_RATE_PERCENTAGE,
	};
};

export const SSS_CONTRIBUTION_RATES = async (salary: number) => {
	const contribution = await prisma.sSSTable.findFirst({
		where: {
			salary_range_from: { lte: salary },
			salary_range_to: { gte: salary },
		},
		orderBy: {
			salary_range_from: 'desc',
		},
	});

	const fallbackContribution = generateSSS2025TableSet().find((row) => salary >= row.salary_range_from && salary <= row.salary_range_to);
	const source = contribution ?? fallbackContribution;

	const total_contribution = source ? source.er_ss + source.er_mpf + source.er_ec + source.ee_ss + source.ee_mpf : 0;

	return { total_contribution: Number(total_contribution.toFixed(2)) };
};
