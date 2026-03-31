import express, { Request, Response, Router } from 'express';
import { prisma } from '../config/prisma';

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response) => {
	try {
		const sss_payload = {
			er_share_rate: 5,
		};

		const philhealth_payload = {
			er_share_rate: 5,
		};

		const pagibig_payload = {
			er_share_rate: 2,
		};

		return res.json({
			sss: sss_payload,
			philhealth: philhealth_payload,
			pagibig: pagibig_payload,
		});
	} catch (error) {
		console.error('Error fetching benefits:', error);
		return res.status(500).json({ message: 'An error occurred while fetching benefits.' });
	}
});

export default router;
