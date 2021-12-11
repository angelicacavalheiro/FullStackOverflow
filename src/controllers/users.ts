import connection from "../database/database";
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

async function userPost(req: Request, res: Response) {
  const name: string = req.body.name;
  const student_class: string = req.body.class;

  // adicionar validações onde sera o service

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

  const token = uuid();

  // adicionando usuario ao banco
  try{
    const userInsert = await connection.query(`
    INSERT INTO "user" (token, user_name, class_id) VALUES ($1, $2, $3)
    RETURNING token
  `, [token, name, class_id])
    res.status(200).send(userInsert.rows[0])
  } catch(error){
    res.send(error)
  }
}

export {
  userPost,
}