import express from "express";
import cors from "cors";

import * as questionController from './controllers/questionController'

const app = express();
app.use(express.json());
app.use(cors());

app.get('/status', (req, res) => {
    res.send('Server online');
});

app.post('/questions', questionController.postQuestion);
app.get('/questions', questionController.getQuestions);

export default app;
