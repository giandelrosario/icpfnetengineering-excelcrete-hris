import express, { Router } from 'express';
import employee from './employee';
import auth from './auth';
import benefits from './benefits';
import sssTable from './sss-table';

const router: Router = express.Router();

router.use('/employee', employee);
router.use('/benefits', benefits);
router.use('/auth', auth);
router.use('/sss-table', sssTable);

export default router;
