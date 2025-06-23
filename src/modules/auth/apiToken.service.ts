/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { DateTime } from 'luxon';
import { LessThan, Repository } from 'typeorm';
import { ApiToken } from './entities/apiToken.entity';
import { User } from '@modules/users/entities/user.entity';

@Injectable()
export class ApiTokenService {
  constructor(
    @InjectRepository(ApiToken)
    private readonly apiTokenRepository: Repository<ApiToken>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateJwtToken(userId: number, expiresAt?: Date): Promise<ApiToken> {
    // Clean up old tokens
    await this.apiTokenRepository.delete({
      userId,
      expiresAt: LessThan(new Date()),
    });

    const token = this.apiTokenRepository.create({
      userId,
      name: 'JWT Token',
      type: 'api',
      token: randomBytes(32).toString('hex'),
      expiresAt: expiresAt || DateTime.now().plus({ days: 60 }).toJSDate(),
    });

    return this.apiTokenRepository.save(token);
  }

  async verifyTokenAndPermissions(
    token: string,
    permissions: string[] = [],
  ): Promise<{
    error: boolean;
    message?: string;
    code?: string;
    user: User | null;
  }> {
    if (!token) {
      return {
        error: true,
        message: 'Missing token',
        code: 'missing_token',
        user: null,
      };
    }

    const data = await this.apiTokenRepository.findOne({
      where: { token },
    });

    if (!data) {
      return {
        error: true,
        message: 'Token not found',
        code: 'invalid_token',
        user: null,
      };
    }

    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      await this.apiTokenRepository.delete(data.id);

      return {
        error: true,
        message: 'Token expired',
        code: 'token_expired',
        user: null,
      };
    }

    const user = await this.userRepository.findOne({
      where: { id: data.userId },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });

    if (!user) {
      return {
        error: true,
        message: 'User not found',
        code: 'user_not_found',
        user: null,
      };
    }

    const allPermissions = user.role?.flatMap(role => role.permissions.map(p => p.slug));

    // Add normalized permissions list
    user.permissions = Array.from(new Set(allPermissions));

    // Optionally clean up roles for response
    user.roles = user.roles.map(role => {
      const { permissions, ...rest } = role;
      return rest;
    });

    // Permission check
    if (permissions.length > 0) {
      const hasPermission = permissions.some(p => user.permissions.includes(p));

      if (!hasPermission) {
        return {
          error: true,
          message: 'Permission denied',
          code: 'permission_denied',
          user: null,
        };
      }
    }

    return {
      error: false,
      message: 'User found',
      code: 'user_found',
      user,
    };
  }
}
