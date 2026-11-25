// Çalıştır: npm run build && node --test test/tasks.http.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { DatabaseModule } from '../dist/database/database.module.js';
import { DataSource } from 'typeorm';
import { TasksModule } from '../dist/tasks/tasks.module.js';
import { HttpExceptionFilter } from '../dist/common/filters/http-exception.filter.js';

process.env.DB_DATABASE = 'gorev_takip_nest_test';
class TestAppModule {}
Module({ imports: [DatabaseModule, TasksModule] })(TestAppModule);

test('Görev API: doğrulama, CRUD ve ortak hata formatı', async () => {
  let app;
  async function start() {
    const application = await NestFactory.create(TestAppModule, {
      logger: false,
    });
    await application.get(DataSource).runMigrations();
    application.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    application.useGlobalFilters(new HttpExceptionFilter());
    await application.listen(0, '127.0.0.1');
    return application;
  }
  app = await start();
  try {
    let url = await app.getUrl();
    async function send(method, path, body) {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body !== undefined) options.body = JSON.stringify(body);
      const response = await fetch(`${url}${path}`, options);
      const data = response.status === 204 ? null : await response.json();
      return { status: response.status, data };
    }
    function checkError(result, status, path) {
      assert.equal(result.status, status);
      assert.equal(result.data.statusCode, status);
      assert.equal(result.data.path, path);
      assert.ok(result.data.message);
      assert.ok(Number.isFinite(Date.parse(result.data.timestamp)));
    }
    for (const body of [
      {},
      { title: '' },
      { title: '   ' },
      { title: 5 },
      { title: null },
    ]) {
      checkError(await send('POST', '/tasks', body), 400, '/tasks');
    }
    const created = await send('POST', '/tasks', {
      title: '  NestJS öğren  ',
      id: 99,
      done: true,
    });
    assert.equal(created.status, 201);
    const id = created.data.id;
    assert.equal(created.data.title, 'NestJS öğren');
    assert.equal(created.data.done, false);
    assert.notEqual(id, 99);
    await app.close();
    app = await start();
    url = await app.getUrl();
    assert.equal(
      (await send('GET', `/tasks/${id}`)).data.title,
      'NestJS öğren',
    );
    assert.ok(
      (await send('GET', '/tasks')).data.some((task) => task.id === id),
    );
    for (const body of [
      { title: null },
      { title: ' ' },
      { done: null },
      { done: 'true' },
    ]) {
      checkError(
        await send('PATCH', `/tasks/${id}`, body),
        400,
        `/tasks/${id}`,
      );
    }
    assert.equal(
      (await send('PATCH', `/tasks/${id}`, { done: true })).data.done,
      true,
    );
    assert.equal((await send('PATCH', `/tasks/${id}`, {})).status, 200);
    checkError(await send('GET', '/tasks/abc'), 400, '/tasks/abc');
    checkError(await send('GET', '/tasks/999'), 404, '/tasks/999');
    checkError(await send('GET', '/unknown'), 404, '/unknown');
    assert.equal((await send('DELETE', `/tasks/${id}`)).status, 204);
    checkError(await send('GET', `/tasks/${id}`), 404, `/tasks/${id}`);
  } finally {
    if (app) await app.close();
  }
});
