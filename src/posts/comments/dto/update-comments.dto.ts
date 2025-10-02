import { PickType } from "@nestjs/mapped-types";
import { CommentsModel } from "../entity/comments.entity";
import { CreateCommentsDto } from "./create-comments.dto";

export class UpdateCommentsDto extends PickType(CreateCommentsDto, ['comment']) {
  
}