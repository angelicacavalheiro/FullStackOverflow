import Joi from 'joi';

const postQuestionSchema = Joi.object({
  question: Joi.string().required(),
  student: Joi.string().required(),
  student_class: Joi.string().pattern(/^[T]{1}[0-9]{1,2}$/),
  tags: Joi.string().required(),
});

const answerSchema = Joi.object({
  answer: Joi.string().min(2).required(),
});

const postUserSchema = Joi.object({
  name: Joi.string().required(),
  student_class: Joi.string().pattern(/^[T]{1}[0-9]{1,2}$/),
});

export {
  postQuestionSchema,
  answerSchema,
  postUserSchema,
}