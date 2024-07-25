import { Controller, Post, Body, HttpStatus, Get, Param, ParseIntPipe, Patch, Delete, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/util/user-info.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('포스트')
@Controller('post')
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
    const channelId = 1;
    const categoryId = 1;
    const data = await this.postService.create(userId, channelId, categoryId, createPostDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '포스트를 생성하였습니다.',
      data,
    };
  }

  /**
   * 포스트 전체조회
   * @returns
   */
  @Get()
  async findAll() {
    const data = await this.postService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: '포스트 전체조회를 성공하였습니다.',
      data,
    };
  }

  /**
   * 내 포스트 조회
   * @param user
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async findMy(@UserInfo() user: User) {
    const userId = user.id;
    const data = await this.postService.findMy(userId);

    return {
      statusCode: HttpStatus.OK,
      message: '내 포스트들 조회에 성공하였습니다',
      data,
    };
  }
  /**
   * 포스트 상세조회
   * @param id
   * @returns
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.postService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
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
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) {
    const data = await this.postService.update(id, updatePostDto);
    return {
      statusCode: HttpStatus.OK,
      message: '포스트를 수정하였습니다.',
      data,
    };
  }

  /**
   * 포스트 삭제
   * @param id
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const data = await this.postService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: '포스트를 삭제하였습니다',
      data,
    };
  }
}
