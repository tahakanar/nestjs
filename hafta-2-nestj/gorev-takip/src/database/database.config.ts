import { ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';
import { Task } from '../tasks/entities/task.entity.js';
import { User } from '../users/entities/user.entity.js';
import { InitialSchema1791800000000 } from './migrations/1791800000000-initial-schema.js';

export function databaseOptions(config: ConfigService): DataSourceOptions {
  const port = Number(config.get('DB_PORT', '55432'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT geçerli bir port olmalıdır');
  }
  return {
    type: 'postgres',
    host: config.get('DB_HOST', '127.0.0.1'),
    port,
    username: config.getOrThrow<string>('DB_USERNAME'),
    password: config.getOrThrow<string>('DB_PASSWORD'),
    database: config.getOrThrow<string>('DB_DATABASE'),
    entities: [User, Task],
    migrations: [InitialSchema1791800000000],
    synchronize: false,
    logging: config.get('DB_LOGGING', 'false') === 'true',
  };
}
