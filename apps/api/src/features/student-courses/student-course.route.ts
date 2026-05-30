import { Hono } from 'hono';
import { studentCourseController } from './student-course.controller';

export const studentCourseRoute = new Hono()
  .get('/', studentCourseController.list)
  .post('/', studentCourseController.create)
  .get('/:id', studentCourseController.detail)
  .put('/:id', studentCourseController.update)
  .delete('/:id', studentCourseController.delete);
