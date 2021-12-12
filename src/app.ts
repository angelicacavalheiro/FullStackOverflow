import express from "express";
import cors from "cors";

import * as questionController from './controllers/questionController'
import { userPost } from './controllers/users'

const app = express();
app.use(express.json());
app.use(cors());

app.get('/status', (req, res) => {
    res.send('Server online');
});

app.post('/questions', questionController.postQuestion);
app.get('/questions', questionController.getQuestions);
app.post('/users', userPost)
app.post('/questions/:id', questionController.answer)

export default app;
