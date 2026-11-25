import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service.js';
import { Task } from './entities/task.entity.js';

describe('TasksService', () => {
  const repository = { findOneBy: vi.fn(), save: vi.fn(), delete: vi.fn() };
  let service: TasksService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repository },
      ],
    }).compile();
    service = module.get(TasksService);
  });

  it('olmayan görev için 404 döner', async () => {
    repository.findOneBy.mockResolvedValue(null);
    await expect(service.findOne(5)).rejects.toMatchObject({ status: 404 });
  });

  it('güncellemeden önce veritabanından görevi bekler', async () => {
    const task = { id: 5, title: 'Öğren', done: true };
    repository.findOneBy.mockResolvedValue(task);
    repository.save.mockImplementation(async (value) => value);
    await expect(service.update(5, { done: false })).resolves.toMatchObject({
      done: false,
    });
    expect(repository.save).toHaveBeenCalledWith(task);
  });

  it('silinen satır yoksa 404 döner', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove(5)).rejects.toMatchObject({ status: 404 });
  });
});
