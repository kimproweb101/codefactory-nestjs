import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as multer from 'multer';
import { v4 as uuid } from 'uuid';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { BadRequestException } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
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
          cb(null, TEMP_FOLDER_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
