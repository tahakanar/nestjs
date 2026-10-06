const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON gövdeyi okuyup req.body'ye koyar
app.use(express.json());

// Veriler bellekte tutulur: sunucu yeniden başlarsa sıfırlanır
let tasks = [
  { id: 1, title: 'Express öğren', done: false },
];
let nextId = 2;

app.get('/', (req, res) => {
  res.send('Merhaba');
});

// GET /tasks  (isteğe bağlı filtre: /tasks?done=true)
app.get('/tasks', (req, res) => {
  const { done } = req.query;
  if (done === undefined) {
    return res.status(200).json(tasks);
  }
  if (done !== 'true' && done !== 'false') {
    return res.status(400).json({ error: "done 'true' ya da 'false' olmalı" });
  }
  res.status(200).json(tasks.filter((t) => t.done === (done === 'true')));
});

// GET /tasks/:id
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Görev bulunamadı' });
  }
  res.status(200).json(task);
});

// POST /tasks
app.post('/tasks', (req, res) => {
  const { title } = req.body ?? {};
  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title zorunlu ve boş olmayan bir string olmalı' });
  }
  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH /tasks/:id  (yalnızca gönderilen alanlar güncellenir)
app.patch('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Görev bulunamadı' });
  }

  const { title, done } = req.body ?? {};
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'title boş olmayan bir string olmalı' });
  }
  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ error: 'done boolean olmalı' });
  }

  if (title !== undefined) task.title = title.trim();
  if (done !== undefined) task.done = done;
  res.status(200).json(task);
});

// DELETE /tasks/:id
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Görev bulunamadı' });
  }
  tasks.splice(index, 1);
  res.status(204).send();
});

// Tanımsız adresler
app.use((req, res) => {
  res.status(404).json({ error: 'Adres bulunamadı' });
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
