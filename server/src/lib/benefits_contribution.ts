import sss from '../json/sss.json';
import { prisma } from '../config/prisma';

type PagIBIGRates = {
	employer_rate: number;
	employee_rate: number;
	total_rate: number;
	total?: number;
};

type SSSContribution = {
	salary_range: [number, number];
	msc: {
		ss: number;
		mpf: number;
	};
	employer: {
		ec: number;
		mpf: number;
	};
	employee: {
		mpf: number;
	};
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

export const SSS_CONTRIBUTION_RATES = (salary: number) => {
	const contribution = sss.find((contribution: any) => {
		const [min, max] = contribution.salary_range as [number, number];
		return salary >= min && salary <= max;
	});

	const total_contribution =
		contribution &&
		contribution.msc.ss * (SSS_EMPLOYER_RATE / 100) +
			contribution.msc.ss * (SSS_EMPLOYEE_RATE / 100) +
			contribution.msc.mpf +
			contribution.employee.mpf +
			contribution.employer.ec +
			contribution.employer.mpf;

	return { total_contribution } as { total_contribution: number };
};
