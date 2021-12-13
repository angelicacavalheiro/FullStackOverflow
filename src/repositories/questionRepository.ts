import connection from '../database/database';

async function findClass(student_class: string) {
  let class_id: number
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
  return class_id
}

interface Id {
  id: number;
}

async function insertQuestion(
  question: string,
  student: string,
  class_id: number,
  tags: string,
  date: Date,
): Promise<Id[]>{
  const result = await connection.query(`
    INSERT INTO questions (question, student, class_id, tags, answered, "submitAt")
    VALUES ($1, $2, $3, $4, false, $5)
    RETURNING id
  `, [question, student, class_id, tags, date]);
  const id: Id[] = (result.rows[0])
  return id;
}

interface Questions {
  id: number,
  question: string,
  student: string,
  class: string,
  submitAt: string,
}

async function getUnansweredQuestions():  Promise<Questions[]> {
  const questions = await connection.query(`
  SELECT questions.id, question, student, class.class_name as "class", "submitAt"
    FROM questions JOIN class ON questions.class_id = class.id
  WHERE answered = false;
  `);
  const questionsUnanswered: Questions[] = (questions.rows)
  return questionsUnanswered;
}
async function postAnswer(
  token: string,
  answer: string,
  id: string,
  date: Date
) {
  await connection.query(`
    UPDATE questions
    SET "answered" = true, "answeredAt" = $1, token_replied = $2, answer = $3
    WHERE id = $4
    RETURNING*
  `, [date, token, answer, id])
  return 'ok'
}

async function getQuestionStatus(id: string) {
  const answered = await connection.query(`
    SELECT answered
      FROM questions WHERE id = $1
  `,[id]);
  return (answered.rows[0].answered)
}

async function getUnansweredQuestion(id: string) {
  const question = await connection.query(`
    SELECT question, student, class.class_name as "class", tags, answered, "submitAt"
      FROM questions JOIN class ON questions.class_id = class.id
    WHERE questions.id = $1;
  `, [id]);
  return question;
}

async function getAnsweredQuestion(id: string) {
  const question = await connection.query(`
  SELECT question, student, class.class_name as "class", tags, answered, "submitAt",
  "answeredAt", "user".user_name as "answeredBy", "answer"
    FROM questions JOIN class ON questions.class_id = class.id
    JOIN "user" ON questions.token_replied = "user".token
  WHERE questions.id = $1;
  `, [id]);
  return question;
}

interface User {
  id: number,
  question: string,
  student: string,
  class: string,
  submitAt: string,
}

async function insertUser(
  token: string, name: string, class_id: number
  ): Promise<User[]> {
  const userInsert = await connection.query(`
    INSERT INTO "user" (token, user_name, class_id) VALUES ($1, $2, $3)
    RETURNING token
  `, [token, name, class_id])
    const userToken: User[] = userInsert.rows[0]
    return userToken;
}

export {
  findClass,
  insertQuestion,
  getUnansweredQuestions,
  postAnswer,
  getQuestionStatus,
  getUnansweredQuestion,
  getAnsweredQuestion,
  insertUser
}