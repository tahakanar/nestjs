import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException
      ? exception.getResponse()
      : null;
    let message: string | string[] = 'Sunucu hatası';

    if (typeof body === 'string') {
      message = body;
    } else if (body && typeof body === 'object' && 'message' in body) {
      const details: unknown = body.message;
      if (typeof details === 'string') message = details;
      else if (Array.isArray(details) && details.every((item) => typeof item === 'string')) {
        message = details;
      }
    }

    if (statusCode >= 500) this.logger.error(exception);

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
