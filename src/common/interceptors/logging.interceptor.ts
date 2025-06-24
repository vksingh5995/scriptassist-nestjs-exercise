import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const now = Date.now();

    const { method, originalUrl: url, body, query, params, user } = request;

    // Safe fields to log - do NOT log passwords, tokens, etc.
    const safeBody = { ...body };
    delete safeBody.password;
    delete safeBody.token;

    const userInfo = user ? `UserID: ${user}` : 'Unauthenticated';

    this.logger.log(
      `Incoming Request -> ${method} ${url} | ${userInfo} | Body: ${JSON.stringify(
        safeBody,
      )} | Query: ${JSON.stringify(query)} | Params: ${JSON.stringify(params)}`,
    );

    return next.handle().pipe(
      tap(resBody => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `Response Sent <- ${method} ${url} | ${userInfo} | Status: ${
            response.statusCode
          } | Time: ${responseTime}ms | Response: ${JSON.stringify(resBody)}`,
        );
      }),
      catchError(error => {
        const responseTime = Date.now() - now;
        this.logger.error(
          `Error in ${method} ${url} | ${userInfo} | Time: ${responseTime}ms | Message: ${
            error.message
          }`,
          error.stack,
        );
        throw error;
      }),
    );
  }
}
