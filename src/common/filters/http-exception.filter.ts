/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[] = 'Internal server error';
    let error: string | undefined;

    // Check if exception is an instance of HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, any>;
        message = res.message || message;
        error = res.error;
      }

      // Log client errors (400–499) as warnings, server errors (500+) as errors
      if (status >= 500) {
        this.logger.error(
          `HTTP ${status} Error: ${JSON.stringify(message)} | ${request.method} ${request.url}`,
          (exception as any).stack,
        );
      } else {
        this.logger.warn(
          `HTTP ${status} Warning: ${JSON.stringify(message)} | ${request.method} ${request.url}`,
        );
      }
    } else {
      // Non-HTTP exception: treat as 500
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      this.logger.error(
        `Unhandled Exception: ${request.method} ${request.url}`,
        (exception as any)?.stack || String(exception),
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error: error || (status >= 500 ? 'Internal Server Error' : undefined),
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }
}
