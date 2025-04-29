import { createParamDecorator, SetMetadata, ExecutionContext } from '@nestjs/common';
import aqp from 'api-query-params';

// truyền thêm metadata vào lời gọi hàm
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); // key:value

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) => 
  SetMetadata(RESPONSE_MESSAGE, message);

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user
);

export const GetPaginateInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const currentPage = +(ctx.switchToHttp().getRequest().query.page) || 1;
    const limit = ctx.switchToHttp().getRequest().query.limit
    const queryString = ctx.switchToHttp().getRequest().query
    const { filter, sort, projection, population } = aqp(queryString);
    delete filter.page;
    delete filter.limit;

    const defaultLimit = +limit || 10;
    const offset = (currentPage - 1) * defaultLimit;

    return {
      offset,
      defaultLimit,
      sort,
      projection,
      population,
      filter,
      currentPage
    }
  }
    
)