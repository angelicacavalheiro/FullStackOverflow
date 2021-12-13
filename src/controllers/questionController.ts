import { Request, Response } from 'express';
import connection from '../database/database';
import { answerSchema } from '../validations/schemas';
import * as service from '../services/questionService';

async function postQuestion(req: Request, res: Response) {

  const question: string = req.body.question;
  const student: string = req.body.student;
  const student_class: string = req.body.class;
  const tags: string = req.body.tags;

  const isValid = await service.validateQuestionPost(
    question,
    student,
    student_class,
    tags,
  )
  if(!isValid){
    return res.status(400).send('faltam informações ou a turma esta fora do padrão esperado(Ex.: T2)')
  }

  const class_id = await service.getClassId(student_class);

  const questionId: {} = await service.insertQuestion(
    question,
    student,
    class_id,
    tags,
  )

  res.status(200).send(questionId)
}

async function getQuestions(req: Request, res: Response) {

  const questiosUnanswered: {} = await service.formatQuestion()

  res.status(200).send(questiosUnanswered)
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