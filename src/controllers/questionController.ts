import { Request, Response } from 'express';
import * as service from '../services/questionService';
import * as repository from '../repositories/questionRepository';

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

  const isValid = await service.validateAnswePost(answer);

  if(!isValid){
    return res.status(400).send('Você deveria enviar uma resposta, ou sua resposta é muito pequena')
  }

  await repository.postAnswer(token, answer, id, date);
  res.sendStatus(200)
}

async function getOneQuestion (req: Request, res: Response) {
  const id: string = req.params.id
  const questionFormated = await service.answeredFormatQuestion(id)
    return res.status(200).send(questionFormated)
}

export {
  postQuestion,
  getQuestions,
  answer,
  getOneQuestion,
}