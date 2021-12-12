import Joi from 'joi';

const postQuestionSchema = Joi.object({
    question: Joi.string().required(),
    student: Joi.string().required(),
    student_class: Joi.string().pattern(/^[T]{1}[0-9]{1,2}$/),
    tags: Joi.string().required(),
});

export {
    postQuestionSchema
}