import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostLike } from 'src/post/entities/post-like.entity';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from './dtos/pagination.dto';
import { OrderType } from './types/order.types';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

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
   * 정렬방식 선택
   * @param DESC, ACS 를 입력받음
   * @returns 정렬결과값
   */
  private getDateOrder(order: OrderType) {
    const orderBy: any = {};
    orderBy.createdAt = order;
    return orderBy;
  }

  /**
   * 좋아요 누른 포스트 조회하기
   * @param userId 유저id
   * @param pageNationDto 정렬, 페이지네이션을 위한 dto
   * @returns 좋아요 누른 포스트 목록
   * 추후에, 다른사람의 좋아요한 포스트를 확인하는 API 구현시 사용할수 있도록 userId 기반으로 구현
   * 조회된 값이 없을경우, 빈 배열 리턴
   */
  async findLikedPostsByUserId(userId: number, pagiNationDto: PaginationDto) {
    const { page, limit, order } = pagiNationDto;
    const options: IPaginationOptions = {
      page,
      limit,
    };

    const { items, meta } = await paginate<PostLike>(
      this.postLikeRepository,
      options,
      {
        where: { user: { id: userId } },
        relations: ['post'],
        order: this.getDateOrder(order),
      }
    );

    const returnPosts = items.filter((item) => item.post);

    return { items: returnPosts, meta };
  }

  /**
   * 내가 작성한 댓글 조회하기
   * @param userId 유저id
   * @param pageNationDto 정렬, 페이지네이션을 위한 dto
   * @returns 작성한 댓글 목록
   * 추후 다른사람이 작성한 댓글을 확인하는 API 구현시 사용할수 있도록 userId 기반으로 구현
   * 조회된 값이 없을경우, 빈 배열 리턴
   */
  async findCommentsByUserId(userId: number, pagiNationDto: PaginationDto) {
    const { page, limit, order } = pagiNationDto;
    const options: IPaginationOptions = {
      page,
      limit,
    };

    return paginate<Comment>(this.commentRepository, options, {
      where: { user: { id: userId } },
      relations: ['post'],
      order: this.getDateOrder(order),
    });
  }

  /**
   * 내가 구매한 포스트 조회하기
   * @param userId 유저id
   * @param pageNationDto 정렬, 페이지네이션을 위한 dto
   * @returns 구매한 포스트 목록
   * 추후 다른사람이 구매한 포스트를 확인하는 API 구현시 사용할수 있도록 userId 기반으로 구현
   * 조회된 값이 없을경우 ,빈배열 리턴
   */
  async findPurchasedPostsByUserId(
    userId: number,
    pagiNationDto: PaginationDto
  ) {
    const { page, limit, order } = pagiNationDto;
    const options: IPaginationOptions = {
      page,
      limit,
    };

    return paginate<PurchaseList>(this.purchaseListRepository, options, {
      where: { user: { id: userId } },
      relations: ['user', 'post'],
      order: this.getDateOrder(order),
      withDeleted: true, // 소프트 삭제된 포스트도 포함
    });
  }
}
