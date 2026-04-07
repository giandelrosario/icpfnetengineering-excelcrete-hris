import express, { Request, Response, Router } from 'express';
import { prisma } from '../config/prisma';
import { SSSRowInput } from '../lib/sss_table_2025';

const router: Router = express.Router();

const normalizeRow = (row: Record<string, unknown>, index: number): SSSRowInput => {
	const toNumber = (value: unknown, fieldName: string) => {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) {
			throw new Error(`Row ${index + 1}: ${fieldName} must be a valid number.`);
		}
		return parsed;
	};

	return {
		salary_range_from: toNumber(row.salary_range_from, 'salary_range_from'),
		salary_range_to: toNumber(row.salary_range_to, 'salary_range_to'),
		msc_ss: toNumber(row.msc_ss, 'msc_ss'),
		msc_mpf: toNumber(row.msc_mpf, 'msc_mpf'),
		er_ss: toNumber(row.er_ss, 'er_ss'),
		er_mpf: toNumber(row.er_mpf, 'er_mpf'),
		er_ec: toNumber(row.er_ec, 'er_ec'),
		ee_ss: toNumber(row.ee_ss, 'ee_ss'),
		ee_mpf: toNumber(row.ee_mpf, 'ee_mpf'),
	};
};

router.get('/', async (_req: Request, res: Response) => {
	try {
		const rows = await prisma.sSSTable.findMany({
			orderBy: [{ salary_range_from: 'asc' }, { salary_range_to: 'asc' }],
		});
		return res.status(200).json(rows);
	} catch (error) {
		console.error('Error fetching SSS table:', error);
		return res.status(500).json({ message: 'An error occurred while fetching SSS table.' });
	}
});

router.put('/replace-set', async (req: Request, res: Response) => {
	const candidateRows = Array.isArray(req.body) ? req.body : req.body?.rows;

	if (!Array.isArray(candidateRows) || candidateRows.length === 0) {
		return res.status(400).json({ message: 'rows is required and must be a non-empty array.' });
	}

	let rows: SSSRowInput[];

	try {
		rows = candidateRows.map((row: unknown, index) => {
			if (!row || typeof row !== 'object') {
				throw new Error(`Row ${index + 1}: invalid object payload.`);
			}

			return normalizeRow(row as Record<string, unknown>, index);
		});
	} catch (error) {
		return res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid rows payload.' });
	}

	const sortedRows = [...rows].sort((a, b) => a.salary_range_from - b.salary_range_from);

	for (let index = 0; index < sortedRows.length; index += 1) {
		const row = sortedRows[index];
		if (!row) continue;
		const previousRow = index > 0 ? sortedRows[index - 1] : undefined;

		if (row.salary_range_from > row.salary_range_to) {
			return res.status(400).json({ message: `Row ${index + 1}: salary_range_from cannot be greater than salary_range_to.` });
		}

		if (previousRow && row.salary_range_from <= previousRow.salary_range_to) {
			return res.status(400).json({ message: `Row ${index + 1}: salary ranges must not overlap.` });
		}
	}

	try {
		await prisma.$transaction([
			prisma.sSSTable.deleteMany(),
			prisma.sSSTable.createMany({
				data: sortedRows,
			}),
		]);

		return res.status(200).json({
			message: 'SSS table set replaced successfully.',
			count: sortedRows.length,
		});
	} catch (error) {
		console.error('Error replacing SSS table set:', error);
		return res.status(500).json({ message: 'An error occurred while replacing SSS table set.' });
	}
});

export default router;
