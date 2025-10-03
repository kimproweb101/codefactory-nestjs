import { BadRequestException, Injectable } from '@nestjs/common';
import { CommentsModel } from './entity/comments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options.const';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateCommentsDto } from './dto/update-comments.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(CommentsModel)
        private readonly commentsRepository: Repository<CommentsModel>,    
        private readonly commonService: CommonService,    
      ) {}
  
    paginateComments(
      dto : PaginateCommentsDto,
      postId: number
    ){
      return this.commonService.paginate(
        dto,
        this.commentsRepository,
        {
          ...DEFAULT_COMMENT_FIND_OPTIONS,
          where:{
              post:{
                  id: postId,
              }
          }
        },
        `posts/${postId}/comments`,
      );
    } 

    async getCommentById(id:number){
      const comment=await this.commentsRepository.findOne({        
        where :{
          id
        },
        relations:{
          author:true,
        }
      })

      if(!comment){
        throw new BadRequestException(
          `id: ${id} Comment는 존재하지 않습니다.`
        )
      }
      
      return comment
    }  
    
    async createComment(postId:number,dto: CreateCommentsDto,author: UsersModel){     
      return this.commentsRepository.save({
        ...dto,
        post:{
          id:postId,
        },
        author
      })
    }
  
    
    async updateComment(dto:UpdateCommentsDto,commentId:number){
      const comment=await this.commentsRepository.findOne({
        where:{
          id:commentId,
        }
      })
      if(!comment){
        throw new BadRequestException(`존재하지 않는 댓글입니다.`)
      }

      const prevComment=await this.commentsRepository.preload({
        id:commentId,
        ...dto,
      });

      const newComment=await this.commentsRepository.save(
        prevComment,
      )
      return newComment;
    }
  
    
    async deleteComment(id:number){
      const comment=await this.commentsRepository.findOne({
        where:{
          id,
        }
      })
      if(!comment){
        throw new BadRequestException(`존재하지 않는 댓글입니다.`)
      }
      await this.commentsRepository.delete(id)
      return id
    } 
    
    async isCommentMine(userId: number, commentId: number) {
        return this.commentsRepository.exist({
            where: {
                id: commentId,
                author: {
                    id: userId,
                }
            },
            relations: {
                author: true,
            }
        });
    }
}
