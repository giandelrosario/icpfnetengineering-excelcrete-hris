import express, { Router } from 'express';
import employee from './employee';
import benefits from './benefits';

const router: Router = express.Router();

router.use('/employee', employee);
router.use('/benefits', benefits);

export default router;
