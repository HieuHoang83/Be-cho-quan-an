// import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

// @Injectable()
// export class ExistPermission implements CanActivate {
//   constructor(private readonly permissionsService: PermissionsService) {}

//   async canActivate(
//     context: ExecutionContext,
//   ): Promise<any> {
//     const request = context.switchToHttp().getRequest();
//     const method = request.body.method;
//     const apiPath = request.body.apiPath;

//     // Check if the email is unique
//     const isValid = await this.permissionsService.checkNewValidPermission(method, apiPath);
//     if (!isValid) {
//       throw new BadRequestException(`Permission with apiPath "${apiPath}", method "${method}" already exists`);
//     }
//     return true;
//   }
// }