import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  async create(createPostDto: CreatePostDto) {
    const { title, preview, content, price } = createPostDto;

    const post = this.postRepository.create({
      title,
      preview,
      content,
      price,
    });
    return post;
  }

  async findAll() {
    const posts = await this.postRepository.find();

    return posts;
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    return post;
  }
}
