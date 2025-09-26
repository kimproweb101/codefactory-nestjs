import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/decorator/user.decorator';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/pagiantion.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostsImagesService } from './image/images.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsImagesService: PostsImagesService,
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // A Model, B Model
  // Post API -> A 모델을 저장하고, B 모델을 저장한다.
  // await repository.save(a)
  // await repository.save(b)

  // 만약에 A를 저장하다가 실패하면 B를 저장하면 안될경우
  // all or nothing
  // transaction
  // start -> 시작
  // commit -> 저장
  // 한가지만 안되더라도 그 전상태로 돌릴 수 있음
  // rollback -> 원상복구

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  async postPosts(@User('id') userId: number, @Body() body: CreatePostDto) {
    // 트랜잭션과 관련된 모든 쿼리를 담당할
    // 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();

    // 쿼리 러너에 연결한다.
    await qr.connect();
    // 쿼리 러너에서 트랜잭션을 시작한다.
    // 이 시점부터 같은 쿼리 러너를 사용하면
    // 트랜잭션 안에서 데이터베이스 액션을 실행 할 수 있다.
    await qr.startTransaction();

    // 로직 실행
    try {
      const post = await this.postsService.createPost(userId, body, qr);

      // throw new InternalServerErrorException('에러가 났습니다.');

      for (let i = 0; i < body.images.length; i++) {
        await this.postsImagesService.createPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );
      }
      // 모든로직이 동시에 실행되면서 db에 적용됨
      await qr.commitTransaction();
      await qr.release();

      return this.postsService.getPostById(post.id);
    } catch (e) {
      // 어떤 에러든 에러가 던져지면
      // 트랜잭션을 종료하고 원래 상태로 되돌린다.
      await qr.rollbackTransaction();
      await qr.release();

      // throw new InternalServerErrorException('에러가 났습니다.');
    }
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
    // @Body('title') title?: string,
    // @Body('content') content?: string,
  ) {
    // return this.postsService.updatePost(+id, author, title, content);
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User('id') userId: number) {
    await this.postsService.generatePosts(userId);
    return true;
  }
}
