// İş mantığı burada: HTTP (req/res) hakkında hiçbir şey bilmez
const { NotFoundError } = require('../middlewares/errors');

let tasks = [{ id: 1, title: 'Katmanlı yapıyı öğren', done: false }];
let nextId = 2;

function findAll(done) {
  if (done === undefined) return tasks;
  return tasks.filter((t) => t.done === done);
}

function findOne(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new NotFoundError('Görev bulunamadı');
  return task;
}

function create({ title }) {
  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  return task;
}

function update(id, { title, done }) {
  const task = findOne(id);
  if (title !== undefined) task.title = title.trim();
  if (done !== undefined) task.done = done;
  return task;
}

function remove(id) {
  const task = findOne(id);
  tasks = tasks.filter((t) => t !== task);
}

module.exports = { findAll, findOne, create, update, remove };
