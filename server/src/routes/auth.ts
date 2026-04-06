import express, { NextFunction, Request, Response, Router } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../lib/jwt';

const router: Router = express.Router();

export interface CustomRequest extends Request {
	user: string | JwtPayload;
}
export interface CustomPayload extends JwtPayload {
	id: string;
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
	const token = req.header('Authorization')?.replace('Bearer ', '') || req.headers.authorization?.replace('Bearer ', '');

	if (!token) return res.status(400).json({ msg: 'Token is required to authenticate, please try again' });

	try {
		const decoded = verifyAccessToken(token as string);
		(req as CustomRequest).user = decoded;
		next();
	} catch (error) {
		if (error) {
			return res.status(401).json({ error, msg: 'Token is invalid. Please authenticate' });
		}
		return res.status(400).json({ msg: 'Something went wrong.' });
	}
};

router.post('/login', async (req: Request, res: Response) => {
	const { password } = req.body;

	if (password !== ADMIN_PASSWORD) {
		return res.status(401).json({ message: 'Invalid password' });
	}

	const user = { id: 'admin' }; // In a real application, you would fetch the user from the database

	const accessToken = signAccessToken(user, { expiresIn: '15m' });
	const refreshToken = signRefreshToken(user, { expiresIn: '1d' });

	return res.json({ access_token: accessToken, refresh_token: refreshToken });
});

router.post('/refresh', async (req: Request, res: Response) => {
	const { token } = req.body;

	if (!token) return res.status(400).json({ msg: 'Refresh token is required, please try again' });

	try {
		const decoded = verifyRefreshToken(token);
		const user = { id: (decoded as CustomPayload).id };

		const newAccessToken = signAccessToken(user);
		const newRefreshToken = signRefreshToken(user);

		return res.json({ access_token: newAccessToken, refresh_token: newRefreshToken });
	} catch (error) {
		if (error) {
			return res.status(401).json({ error, msg: 'Refresh token is invalid. Please authenticate' });
		}
		return res.status(400).json({ msg: 'Something went wrong.' });
	}
});

export default router;
