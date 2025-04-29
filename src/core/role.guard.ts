import { Injectable, CanActivate, ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CheckAccessToRoute implements CanActivate {
  private readonly role: string;

  constructor(role: string) {
    this.role = role;
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    if (user.role !== this.role) {
      throw new ForbiddenException(`Access denied for role: ${user.role}`);
    }

    return true;
  }
}