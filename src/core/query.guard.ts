import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

@Injectable()
export class CheckQueryForPagination implements CanActivate {
  async canActivate(
    context: ExecutionContext,
  ): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const limit = request.query.limit ? Number(request.query.limit) : null;
    const page = request.query.page ? Number(request.query.page) : null;

    // Check if limit is present and if it's a valid positive integer
    if (limit !== null && (!Number.isInteger(limit) || limit <= 0)) {
      throw new BadRequestException('Limit must be a positive integer');
    }

    // Check if page is present and if it's a valid positive integer
    if (page !== null && (!Number.isInteger(page) || page <= 0)) {
      throw new BadRequestException('Page must be a positive integer');
    }

    return true;
  }
}