import express, { Request, Response, Router } from 'express';
import { prisma } from '../config/prisma';

const router: Router = express.Router();

// Get all benefits settings
router.get('/', async (req: Request, res: Response) => {
	try {
		const settings = await prisma.employerShare.findFirst({
			orderBy: { created_at: 'desc' },
		});

		if (!settings) {
			// Create default settings if none exist
			const newSettings = await prisma.employerShare.create({
				data: {
					sss_share: 0,
					philhealth_share: 0,
					pagibig_share: 0,
				},
			});
			return res.status(200).json(newSettings);
		}
		return res.status(200).json(settings);
	} catch (error) {
		console.error('Error fetching settings:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

// Create or update benefits settings
router.post('/', async (req: Request, res: Response) => {
	try {
		const { sss_share, philhealth_share, pagibig_share } = req.body;

		const newSettings = await prisma.employerShare.create({
			data: {
				sss_share: sss_share || 0,
				philhealth_share: philhealth_share || 0,
				pagibig_share: pagibig_share || 0,
			},
		});
		return res.status(201).json(newSettings);
	} catch (error) {
		console.error('Error updating settings:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

// Update specific benefit setting
router.put('/:id', async (req: Request, res: Response) => {
	try {
		const { id } = req.params as { id: string };
		const { sss_share, philhealth_share, pagibig_share } = req.body;

		const updated = await prisma.employerShare.update({
			where: { id: parseInt(id) },
			data: {
				...(sss_share !== undefined && { sss_share }),
				...(philhealth_share !== undefined && { philhealth_share }),
				...(pagibig_share !== undefined && { pagibig_share }),
			},
		});

		return res.status(200).json(updated);
	} catch (error) {
		console.error('Error updating settings:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

export default router;
