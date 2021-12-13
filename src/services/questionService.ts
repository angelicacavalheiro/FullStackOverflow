import { postQuestionSchema } from '../validations/schemas';
import connection from '../database/database';
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

export {
  validateQuestionPost,
  getClassId,
  insertQuestion,
  formatQuestion,
}