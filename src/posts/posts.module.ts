import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import * as multer from 'multer';
import { v4 as uuid } from 'uuid';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { PUBLIC_FOLDER_PATH } from 'src/common/const/path.const';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CommonModule,
    TypeOrmModule.forFeature([PostsModel]),
    MulterModule.register({
      limits: {
        // 바이트 단위로 입력
        fileSize: 10000000,
      },
      // cb(에러, boolean)
      // 첫번째 파라미터 : 에러가 있을경우 에러 정보를 넣어준다
      // 두번쨰 파라미터는 파일을 받을지 말지 boolean 을 넣어준다.
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        if (ext !== 'jpg' && ext !== '.jpeg' && ext !== '.png') {
          return cb(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'),
            false,
          );
        }
        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, PUBLIC_FOLDER_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
