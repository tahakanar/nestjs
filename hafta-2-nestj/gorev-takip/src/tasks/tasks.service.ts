import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { Task } from './entities/task.entity.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
  ) {}

  create(dto: CreateTaskDto) {
    const task = this.tasks.create({ title: dto.title.trim(), done: false });
    return this.tasks.save(task);
  }

  findAll() {
    return this.tasks.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const task = await this.tasks.findOneBy({ id });
    if (!task) throw new NotFoundException('Görev bulunamadı');
    return task;
  }

  async update(id: number, dto: UpdateTaskDto) {
    const task = await this.findOne(id);
    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.done !== undefined) task.done = dto.done;
    return this.tasks.save(task);
  }

  async remove(id: number) {
    const result = await this.tasks.delete(id);
    if (!result.affected) throw new NotFoundException('Görev bulunamadı');
  }
}
