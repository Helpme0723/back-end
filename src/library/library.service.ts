import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostLike } from 'src/post/entities/post-like.entity';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from './dtos/pagination.dto';
import { SortField } from './types/field.types';
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
   * PaginationDTO을 입력값에 따라 TypeORM 구문으로 변환하는 함수
   * @param order 정렬 방식 기준값 Enum Type ASC, DESC
   * @param sort 사전순, 날짜순 판별 기준값 Enum Type DATE, ALPHABET
   * @returns
   */
  private getOrder(order: OrderType, sort: SortField) {
    const orderBy: any = {};
    if (sort === SortField.DATE) {
      orderBy.createdAt = order;
    } else if (sort === SortField.ALPHABET) {
      orderBy.title = order;
    }
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
  async findLikedPostsByUesrId(userId: number, pagiNationDto: PaginationDto) {
    const { page, limit, order, sort } = pagiNationDto;
    const options: IPaginationOptions = {
      page,
      limit,
    };

    return paginate<PostLike>(this.postLikeRepository, options, {
      where: { user: { id: userId } },
      relations: ['post'],
      order: this.getOrder(order, sort),
    });
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
    const { page, limit, order, sort } = pagiNationDto;
    const options: IPaginationOptions = {
      page,
      limit,
    };

    return paginate<Comment>(this.commentRepository, options, {
      where: { user: { id: userId } },
      relations: ['user', 'post'],
      order: this.getOrder(order, sort),
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
    const { page, limit, order, sort } = pagiNationDto;
    const options: IPaginationOptions = {
      page,
      limit,
    };

    return paginate<PurchaseList>(this.purchaseListRepository, options, {
      where: { user: { id: userId } },
      relations: ['user', 'post'],
      order: this.getOrder(order, sort),
    });
  }
}
