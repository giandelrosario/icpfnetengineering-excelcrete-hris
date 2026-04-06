import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const FormatAsMoney = (str: any) => {
	return (str + '').replace(/\b(\d+)((\.\d+)*)\b/g, function (_a, b, c) {
		return (b.charAt(0) > 0 && !(c || '.').lastIndexOf('.') ? b.replace(/(\d)(?=(\d{3})+$)/g, '$1,') : b) + c;
	});
};

export const CIVIL_STATUS = ['SINGLE', 'MARRIED', 'DIVORCED'];
