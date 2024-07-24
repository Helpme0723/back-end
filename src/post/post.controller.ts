import { Controller, Post, Body, HttpStatus, Get } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    const data = await this.postService.create(createPostDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.postService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: '',
      data,
    };
  }
}
