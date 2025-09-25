import { PostsModel } from '../entities/posts.entity';
import { PickType } from '@nestjs/mapped-types';

export class CreaetePostDto extends PickType(PostsModel, [
  'title',
  'content',
]) {}
