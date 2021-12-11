import express from "express";
import cors from "cors";

import questionController from './controllers/questionController'

const app = express();
app.use(express.json());
app.use(cors());

app.get('/status', (req, res) => {
    res.send('Server online');
});

app.post('/questions', questionController);

export default app;
