import { IsOptional, IsString } from 'class-validator';
import { CreaetePostDto } from './create-post.dto';
import { PartialType } from '@nestjs/mapped-types';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class UpdatePostDto extends PartialType(CreaetePostDto) {
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  title?: string;

  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  content?: string;
}
