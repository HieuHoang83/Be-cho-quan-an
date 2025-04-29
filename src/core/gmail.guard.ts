import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class UniqueGmail implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<any> {
    // const request = context.switchToHttp().getRequest();
    // const email = request.body.email;
    // if (!email) {
    //   throw new BadRequestException(`Please enter your email.`);
    // }

    // // Check if the email is unique
    // const user = await this.usersService.findOneByEmail(email);
    // if (user) {
    //   throw new BadRequestException(`Email ${email} already exists. Please use a different email.`);
    // }
    return true;
  }
}
