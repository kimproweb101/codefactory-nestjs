import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from './decorator/roles.decorator';
import { RolesEnum } from './const/roles.const';
import { UsersModel } from './entity/users.entity';
import { User } from 'src/decorator/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * serialization -> 직렬화 -> 현재 시스템에서 사용되는 (NestJS) 데이터의 구조를 다른 시스템에서도 쉽게 사용 할 수 있는 포맷으로 변환
   * class의 object에서 JSON 포맷으로 변환   *
   */
  @Get()
  @Roles(RolesEnum.ADMIN)
  getUsers() {
    return this.usersService.getAllusers();
  }

  @Get('follow/me')
  async getFollow(
    @User() user: UsersModel,
    @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe) includeNotConfirmed: boolean
  ){
    return this.usersService.getFollowers(user.id,includeNotConfirmed);
  }

  @Post('follow/:id')
  async postFollow(
    @User() user:UsersModel,
    @Param('id', ParseIntPipe) followeeId :number
  ){
    await this.usersService.followUser(user.id,followeeId)
    return true
  }

  @Patch('follow/:id/confirm')
  async patchFollowConfirm(
    @User() user:UsersModel,
    @Param('id', ParseIntPipe) followerId:number    
  ){
    await this.usersService.confirmFollow(followerId, user.id)
    return true
  }

  @Delete('follow/:id')
  async deleteFollow(
    @User() user:UsersModel,
    @Param('id', ParseIntPipe) followeeId:number
  ){
    await this.usersService.deleteFollow(
      user.id,
      followeeId,
    )
    return true
  }
}
