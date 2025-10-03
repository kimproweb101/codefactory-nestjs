import { IsNumber, IsString } from "class-validator";
import { BaseModel } from "src/common/entity/base.entity";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";
import { PostsModel } from "src/posts/entity/posts.entity";
import { UsersModel } from "src/users/entity/users.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class CommentsModel extends BaseModel{

  @ManyToOne(() => UsersModel, (user) => user.postComments, {
    nullable: false,
  })
  author: UsersModel;

  @ManyToOne(() => PostsModel, (posts) => posts.comments, {
    nullable: false,
    onDelete:'CASCADE',
  })
  post: PostsModel;
  
  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  comment : string
  
  @Column({
    default:0
  })
  @IsNumber()
  likeCount : number
}