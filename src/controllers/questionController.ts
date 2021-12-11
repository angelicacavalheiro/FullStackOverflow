import { Request, Response } from 'express';
import connection from '../database/database';

export default async function questionController(req: Request, res: Response) {
    res.send('estou na rota question no controller questionController')
}