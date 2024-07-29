import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostLike } from 'src/post/entities/post-like.entity';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(PurchaseList)
    private readonly purchaseListRepository: Repository<PurchaseList>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {}

  /**
   * 좋아요 누른 포스트 조회하기
   * @param userId 유저id
   * @returns 좋아요 누른 포스트 목록
   * 추후에, 다른사람의 좋아요한 포스트를 확인하는 API 구현시 사용할수 있도록 userId 기반으로 구현
   * 조회된 값이 없을경우, 빈 배열 리턴
   */
  async findLikedPostsByUesrId(userId: number) {
    const postLikes = await this.postLikeRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
    });

    return postLikes;
  }

  /**
   * 내가 작성한 댓글 조회하기
   * @param userId 유저id
   * @returns 작성한 댓글 목록
   * 추후 다른사람이 작성한 댓글을 확인하는 API 구현시 사용할수 있도록 userId 기반으로 구현
   * 조회된 값이 없을경우, 빈 배열 리턴
   */
  async findCommentsByUserId(userId: number) {
    const comments = await this.commentRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'post'],
    });

    return comments;
  }

  /**
   * 내가 구매한 포스트 조회하기
   * @param userId 유저id
   * @returns 구매한 포스트 목록
   * 추후 다른사람이 구매한 포스트를 확인하는 API 구현시 사용할수 있도록 userId 기반으로 구현
   * 조회된 값이 없을경우 ,빈배열 리턴
   */
  async findPurchasedPostByUserId(userId: number) {
    const purchasePosts = await this.purchaseListRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'post'],
    });

    return purchasePosts;
  }
}
