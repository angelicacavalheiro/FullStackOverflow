import { postQuestionSchema, answerSchema, postUserSchema} from '../validations/schemas';
import { v4 as uuid } from 'uuid';
import * as repository from '../repositories/questionRepository';

async function validateQuestionPost(
  question: string,
  student: string,
  student_class: string,
  tags: string
){
  const errors = postQuestionSchema.validate(
    {
      question,
      student,
      student_class,
      tags,
    }).error;

    if(errors){
      console.log(errors)
      return null
    }
    return 'ok'
}

async function getClassId(student_class: string) {
  const class_id: number = await repository.findClass(student_class)
  return class_id
}

async function insertQuestion(
  question: string,
  student: string,
  class_id: number,
  tags: string
){
  const date = new Date()

  const questionId: {} = await repository.insertQuestion(
    question,
    student,
    class_id,
    tags,
    date,
  )

  return (questionId)
}

async function formatQuestion() {
  const questions = await repository.getUnansweredQuestions()

  const questiosFormated: {} = questions.map(question => (
    {
      id: question.id,
      question: question.question,
      student: question.student,
      class: question.class,
      submitAt: (question.submitAt).substring(0, (question.submitAt).length-13).replace(/[T]/, ' ')
    }
  ))

  return questiosFormated
}

async function validateAnswePost(
  answer: string,
){
  const errors = answerSchema.validate(
    {
      answer,
    }).error;

    if(errors){
      console.log(errors)
      return null
    }
    return 'ok'
}

async function answeredFormatQuestion(id: string) {
  const questions = await repository.getQuestionStatus(id)
  let questionsFormated

  if (questions === false) {
    const question = await repository.getUnansweredQuestion(id);
    questionsFormated = question.rows.map(q => (
      {
        question: q.question,
        student: q.student,
        class: q.class,
        tags: q.tags,
        answered: q.answered,
        submitAt: (q.submitAt).substring(0, (q.submitAt).length-13).replace(/[T]/, ' ')
      }
    ))
  }
  else {
    const question = await repository.getAnsweredQuestion(id);
    questionsFormated = question.rows.map(q => (
      {
        question: q.question,
        student: q.student,
        class: q.class,
        tags: q.tags,
        answered: q.answered,
        submitAt: (q.submitAt).substring(0, (q.submitAt).length-13).replace(/[T]/, ' '),
        answeredAt: (q.answeredAt).substring(0, (q.answeredAt).length-13).replace(/[T]/, ' '),
        answeredBy: q.answeredBy,
        answer: q.answer
      }
    ))
  }
  return questionsFormated[0]
}

async function validateUserPost(
  name: string,
  student_class: string,
){
  const errors = postUserSchema.validate(
    {
      name,
      student_class
    }).error;

    if(errors){
      console.log(errors)
      return null
    }
    return 'ok'
}

async function createToken() {
  const token = uuid();
  return token
}

async function insertUser(token: string, name: string, class_id: number){
  const postAndGetToken = await repository.insertUser(token, name, class_id)
  return postAndGetToken
}

export {
  validateQuestionPost,
  getClassId,
  insertQuestion,
  formatQuestion,
  validateAnswePost,
  answeredFormatQuestion,
  validateUserPost,
  createToken,
  insertUser,
}