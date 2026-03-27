import express, { Router } from 'express';
import employee from './employee';

const router: Router = express.Router();

router.use('/employee', employee);

export default router;
