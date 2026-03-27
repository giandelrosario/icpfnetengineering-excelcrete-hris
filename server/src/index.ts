import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import routes from './routes/index';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.use('/api', routes);

app.get('/', (req, res) => {
	return res.json({ message: 'Welcome to the ICP-FNET Engineering & Excelcrete HRIS API!' });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT} | http://localhost:${PORT}`);
});
