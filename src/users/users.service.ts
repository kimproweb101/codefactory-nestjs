import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';
import { Repository } from 'typeorm';
import { UserFollowersModel } from './entity/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly usersFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  async createUser(user: Pick<UsersModel, 'email' | 'password' | 'nickname'>) {
    // 1) nickname 중복이 없는지 확인
    // exist()=> 만약에 조건에 해당
    const nicknameExist = await this.usersRepository.exist({
      where: {
        nickname: user.nickname,
      },
    });
    if (nicknameExist) {
      throw new BadRequestException('이미 존재하는 nickname 입니다!');
    }

    const emailExists = await this.usersRepository.exist({
      where: {
        email: user.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('이미 가입한 email 입니다!');
    }

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(userObject);
    return newUser;
  }

  async getAllusers() {
    return await this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async followUser(followerId:number, followeeId:number){
    const result=await this.usersFollowersRepository.save({
      follower:{
        id:followerId
      },
      followee:{
        id:followeeId,
      }
    })

    return true
  }

  async getFollowers(userId:number, includeNotConfirmed: boolean){
    /**
     *  
     */
    const where= {
      followee:{
        id:userId
      },      
    }

    if(!includeNotConfirmed){
      where['isConfirmed']=true
    }

    const result=await this.usersFollowersRepository.find({
      where,
      relations:{
        follower:true,
        followee:true,
      }
    })
    return result.map((x)=> ({
      id:x.follower.id,
      nickname:x.follower.nickname,
      email:x.follower.email,
      isConfirmed: x.isConfirmed
    }))
  }

  async confirmFollow(followerId:number, followeeId:number){
    const existing = await this.usersFollowersRepository.findOne({
      where:{
        follower:{
          id: followerId,
        },
        followee:{
          id:followeeId
        }
      },
      relations: {
        follower:true,
        followee:true
      }
    })

    if(!existing){
      throw new BadRequestException('존재하지 않는 팔로우 요청입니다.')
    }

    await this.usersFollowersRepository.save({
      ...existing,
      isConfirmed:true,
    })
    return true
  }

  async deleteFollow(
    followerId:number,
    followeeId:number,
  ){
    await this.usersFollowersRepository.delete({
      follower:{
        id: followerId,
      },
      followee:{
        id: followeeId
      }
    })

    return true
  }
}
