require('./db'); // .env'i yükler (PORT için de gerekli)
const express = require('express');
const logger = require('./middlewares/logger');
const authRouter = require('./routes/auth.routes');
const tasksRouter = require('./routes/tasks.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Sıra önemli: istek yukarıdan aşağıya bu middleware'lerden geçer
app.use(logger);
app.use(express.json());

app.get('/', (req, res) => res.send('Merhaba'));
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);

app.use(notFoundHandler);
app.use(errorHandler); // en sonda olmalı

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
