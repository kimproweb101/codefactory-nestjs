import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [    
    TypeOrmModule.forFeature([PostsModel]),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
