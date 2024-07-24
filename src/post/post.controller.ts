import { Controller, Post, Body, HttpStatus, Get, Param, ParseIntPipe, Patch, Request } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('포스트')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * 포스트 생성
   * @param createPostDto
   * @returns
   */
  @Post()
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    const userId = 1;
    const seriesId = 1;
    const channelId = 1;
    const categoryId = 1;
    const data = await this.postService.create(userId, seriesId, channelId, categoryId, createPostDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '',
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
      message: '',
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
    console.log(id);
    const data = await this.postService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: '',
      data,
    };
  }

  /**
   * 포스트 수정
   * @param id
   * @param updatePostDto
   * @returns
   */
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) {
    const data = await this.postService.update(id, updatePostDto);
    return {
      statusCode: HttpStatus.OK,
      message: '',
      data,
    };
  }
}
