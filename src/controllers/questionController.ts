import { Request, Response } from 'express';
import connection from '../database/database';
import { postQuestionSchema, answerSchema } from '../validations/schemas'

async function postQuestion(req: Request, res: Response) {

  const question: string = req.body.question;
  const student: string = req.body.student;
  const student_class: string = req.body.class;
  const tags: string = req.body.tags;

  // adicionar validações onde sera o service

  const errors = postQuestionSchema.validate(
    {
      question,
      student,
      student_class,
      tags,
    }).error;

    if(errors){
      console.log(errors)
      return  res.status(400).send('faltam informações ou a turma esta fora do padrão esperado(Ex.: T2)')
    }

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
    VALUES ($1, $2, $3, $4, false, $5)
    RETURNING id
  `, [question, student, class_id, tags, date]);

  res.status(200).send(result.rows[0])
}

async function getQuestions(req: Request, res: Response) {
  const questions = await connection.query(`
  SELECT questions.id, question, student, class.class_name as "class", "submitAt"
    FROM questions JOIN class ON questions.class_id = class.id
  WHERE answered = false;
  `);

  const questiosFormated = questions.rows.map(question => (
    {
      id: question.id,
      question: question.question,
      student: question.student,
      class: question.class,
      submitAt: (question.submitAt).substring(0, (question.submitAt).length-13).replace(/[T]/, ' ')
    }
  ))

  // saida = entrada.substring(0, entrada.length-13).replace(/[T]/, ' ')

  res.status(200).send(questiosFormated)
}

async function answer(req: Request, res: Response) {
  const authorization: string = req.headers['authorization'];
  const token: string = authorization?.replace('Bearer ', '');
  const answer: string = req.body.answer;
  const id: string = req.params.id
  const date = new Date()

  const errors = answerSchema.validate(
    {
      answer,
    }).error;

    if(errors){
      console.log(errors)
      return res.status(400).send('Você deveria enviar uma resposta, ou sua resposta é muito pequena')
    }

  await connection.query(`
    UPDATE questions
    SET "answered" = true, "answeredAt" = $1, token_replied = $2, answer = $3
    WHERE id = $4
    RETURNING*
  `, [date, token, answer, id])
  res.sendStatus(200)
}

async function getOneQuestion (req: Request, res: Response) {
  const id: string = req.params.id

  const answered = await connection.query(`SELECT answered FROM questions WHERE id = $1;`, [id]);
  if (answered.rows[0].answered === false) {
    const questions = await connection.query(`
      SELECT question, student, class.class_name as "class", tags, answered, "submitAt"
        FROM questions JOIN class ON questions.class_id = class.id
      WHERE questions.id = $1;
    `, [id]);

    const questiosFormated = questions.rows.map(question => (
      {
        question: question.question,
        student: question.student,
        class: question.class,
        tags: question.tags,
        answered: question.answered,
        submitAt: (question.submitAt).substring(0, (question.submitAt).length-13).replace(/[T]/, ' ')
      }
    ))

    return res.status(200).send(questiosFormated)
  }
  const questions = await connection.query(`
    SELECT question, student, class.class_name as "class", tags, answered, "submitAt",
    "answeredAt", "user".user_name as "answeredBy", "answer"
      FROM questions JOIN class ON questions.class_id = class.id
      JOIN "user" ON questions.token_replied = "user".token
    WHERE questions.id = $1;
    `, [id]);

    const questiosFormated = questions.rows.map(question => (
      {
        question: question.question,
        student: question.student,
        class: question.class,
        tags: question.tags,
        answered: question.answered,
        submitAt: (question.submitAt).substring(0, (question.submitAt).length-13).replace(/[T]/, ' '),
        answeredAt: (question.answeredAt).substring(0, (question.answeredAt).length-13).replace(/[T]/, ' '),
        answeredBy: question.answeredBy,
        answer: question.answer
      }
    ))
  res.status(200).send(questiosFormated)
}

export {
  postQuestion,
  getQuestions,
  answer,
  getOneQuestion,
}