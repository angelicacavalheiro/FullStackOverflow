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
    FROM questions JOIN class ON questions.class_id = class.id
  WHERE answered = false;
  `);

  res.status(200).send(result.rows)
}

async function answer(req: Request, res: Response) {
  const authorization: string = req.headers['authorization'];
  const token: string = authorization?.replace('Bearer ', '');
  const answer: string = req.body.answer;
  const id: string = req.params.id
  const date = new Date()
  await connection.query(`
    UPDATE questions
    SET "answered" = true, "answeredAt" = $1, token_replied = $2, answer = $3
    WHERE id = $4
    RETURNING*
  `, [date, token, answer, id])
  res.sendStatus(200)
}

async function getOneQuestion(req: Request, res: Response) {
  const id: string = req.params.id

  const answered = await connection.query(`SELECT answered FROM questions WHERE id = $1;`, [id]);
  if (answered.rows[0].answered === 'false') {
    const result = await connection.query(`
      SELECT question, student, class.class_name as "class", tags, answered, "submitAt"
        FROM questions JOIN class ON questions.class_id = class.id
      WHERE questions.id = $1;
    `, [id]);
    return res.status(200).send(result.rows[0])
  }
  const result = await connection.query(`
    SELECT question, student, class.class_name as "class", tags, answered, "submitAt",
    "answeredAt", "user".user_name as "answeredBy", "answer"
      FROM questions JOIN class ON questions.class_id = class.id
      JOIN "user" ON questions.token_replied = "user".token
    WHERE questions.id = $1;
    `, [id]);
  res.status(200).send(result.rows[0])
}

export {
  postQuestion,
  getQuestions,
  answer,
  getOneQuestion,
}