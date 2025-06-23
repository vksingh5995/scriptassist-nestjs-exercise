/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCodes } from '@common/const/ErrorCodes';
import { ApiTokenService } from '../apiToken.service';
import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly apiTokenService: ApiTokenService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const authHeader: string | undefined = req.headers?.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException(ErrorCodes.UNAUTHORIZED);
      }

      const token = authHeader.split(' ')[1];

      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      // Extract required permissions from decorator
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      const isValid = await this.apiTokenService.verifyTokenAndPermissions(
        decoded.tokenId,
        requiredPermissions,
      );

      if (!isValid) {
        throw new UnauthorizedException(ErrorCodes.UNAUTHORIZED);
      }

      // Attach user to request object
      req.user = decoded;

      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('JWT Auth Guard Error:', error);
      }
      throw new UnauthorizedException(ErrorCodes.UNAUTHORIZED);
    }
  }
}
