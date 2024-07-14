import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { StatusCode } from "./common/status-code";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // eslint-disable-next-line no-console
    console.error(exception);

    let message: string;
    if (typeof exception.getResponse() === "string") {
      message = exception.getResponse() as string;
    } else {
      const exceptionResponse = exception.getResponse() as { message: any };

      if (Array.isArray(exceptionResponse.message)) {
        message = (exception.getResponse() as { message: any }).message[0];
      } else if (typeof exceptionResponse.message === "string") {
        message = exceptionResponse.message;
      } else {
        message = exception.message;
      }
    }

    response.status(HttpStatus.OK).json({
      status: StatusCode.ERROR,
      message,
    });
  }
}
