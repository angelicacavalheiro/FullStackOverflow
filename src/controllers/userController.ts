import { Request, Response } from 'express';
import * as service from '../services/questionService'

async function userPost(req: Request, res: Response) {
  const name: string = req.body.name;
  const student_class: string = req.body.class;

  try{
    const isValid = await service.validateUserPost(name, student_class)
    if(!isValid){
      return  res.status(400).send('faltam informações ou a turma esta fora do padrão esperado(Ex.: T2)')
    }

    const class_id = await service.getClassId(student_class);
    const token = await service.createToken();
    const userInsert = await service.insertUser(token, name, class_id)
    res.status(200).send(userInsert)

  } catch(error){
    res.send(error)
  }
}

export {
  userPost,
}