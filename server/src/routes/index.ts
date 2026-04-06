import express, { Router } from 'express';
import employee from './employee';
import auth from './auth';
import benefits from './benefits';

const router: Router = express.Router();

router.use('/employee', employee);
router.use('/benefits', benefits);
router.use('/auth', auth);

export default router;
