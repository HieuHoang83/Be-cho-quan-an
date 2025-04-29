import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

@Injectable()
export class CheckValidId implements CanActivate {
  async canActivate(
    context: ExecutionContext,
  ): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;

    // Check if id is a valid integer
    const isValid = Number.isInteger(Number(id));
    if (!isValid || Number(id) <= 0) {
      throw new BadRequestException('Id is invalid');
    }
    return true;
  }
}