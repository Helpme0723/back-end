import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { FindAllPostDto } from './dto/find-all-post-by-channel-id.dto';

@ApiTags('04.포스트')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * 포스트 생성
   * @param createPostDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@UserInfo() user: User, @Body() createPostDto: CreatePostDto) {
    const userId = user.id;
    const data = await this.postService.create(userId, createPostDto);
    return {
      status: HttpStatus.CREATED,
      message: '포스트를 생성하였습니다.',
      data,
    };
  }
  /**
   * 전체포스트 조회
   * @param findAllPostDto
   * @returns
   */
  @Get()
  async findAll(@Query() findAllPostDto: FindAllPostDto) {
    const data = await this.postService.findAll(findAllPostDto);
    return {
      status: HttpStatus.OK,
      message: '포스트 전체조회를 성공하였습니다.',
      data,
    };
  }

  /**
   * 내 포스트조회
   * @param user
   * @param findAllPostDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async findMy(
    @UserInfo() user: User,
    @Query() findAllPostDto: FindAllPostDto
  ) {
    const userId = user.id;
    const data = await this.postService.findMy(userId, findAllPostDto);

    return {
      status: HttpStatus.OK,
      message: '내 포스트들 조회에 성공하였습니다',
      data,
    };
  }
  /**
   * 포스트 상세조회
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@UserInfo() user: User, @Param('id', ParseIntPipe) id: number) {
    const userId = user.id;
    const data = await this.postService.findOne(userId, id);
    await this.postService.incrementViewCount(id);
    return {
      status: HttpStatus.OK,
      message: '포스트 상세조회에 성공하였습니다.',
      data,
    };
  }

  /**
   * 로그인하지 않은 유저의 상세보기
   * @param id
   * @returns
   */
  @Get(':id/unlogin')
  async readOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.postService.readOne(id);
    await this.postService.incrementViewCount(id);
    return {
      status: HttpStatus.OK,
      message: '포스트 상세조회에 성공하였습니다.',
      data,
    };
  }

  /**
   * 포스트 수정
   * @param id
   * @param updatePostDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @UserInfo() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto
  ) {
    const data = await this.postService.update(user.id, id, updatePostDto);
    return {
      status: HttpStatus.OK,
      message: '포스트를 수정하였습니다.',
      data,
    };
  }

  /**
   * 포스트 삭제
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@UserInfo() user: User, @Param('id', ParseIntPipe) id: number) {
    const userId = user.id;
    const data = await this.postService.delete(userId, id);
    return {
      status: HttpStatus.OK,
      message: '포스트를 삭제하였습니다',
      data,
    };
  }

  /**
   * 포스트 좋아요 등록
   * @param user
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/postlike')
  async createLike(
    @UserInfo() user: User,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = user.id;
    const data = await this.postService.createPostLike(userId, id);

    return {
      status: HttpStatus.OK,
      message: '좋아요 를 등록하였습니다',
      data,
    };
  }

  /**
   * 좋아요 취소
   * @param user
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/postlike')
  async deleteLike(
    @UserInfo() user: User,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = user.id;
    const data = await this.postService.deletePostLike(userId, id);

    return {
      status: HttpStatus.OK,
      message: '좋아요를 취소하였습니다',
      data,
    };
  }
}
