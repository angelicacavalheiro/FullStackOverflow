import { Request, Response } from 'express';
import connection from '../database/database';

async function postQuestion(req: Request, res: Response) {

  const question: string = req.body.question;
  const student: string = req.body.student;
  const student_class: string = req.body.class;
  const tags: string = req.body.tags;

  // adicionar validações onde sera o service

  const date = new Date()

  // procurar se existe classe, se n existe inserir e retornar o id
  let class_id
  const existClass = await connection.query(`
    SELECT id FROM class WHERE class_name = ($1)
  `, [student_class])
  if(!existClass.rowCount) {
    const result = await connection.query (`
    INSERT INTO class (class_name) VALUES ($1) RETURNING id`,
    [student_class]);
    class_id = result.rows[0].id
  } else {
    class_id = existClass.rows[0].id
  }

  // adicionando pergunta ao banco
  const result = await connection.query(`
    INSERT INTO questions (question, student, class_id, tags, answered, "submitAt")
    VALUES ($1, $2, $3, $4, 'false', $5)
    RETURNING id
  `, [question, student, class_id, tags, date]);

  res.status(200).send(result.rows[0])
}

async function getQuestions(req: Request, res: Response) {
  const result = await connection.query(`
  SELECT questions.id, question, student, class.class_name as "class", "submitAt"
    FROM questions JOIN class ON questions.class_id = class.id;
  `)

  res.status(200).send(result.rows)
}

export {
  postQuestion,
  getQuestions,
}