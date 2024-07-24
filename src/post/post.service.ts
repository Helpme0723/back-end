import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  async create(userId: number, seriesId: number, channelId: number, categoryId: number, createPostDto: CreatePostDto) {
    const { title, preview, content, price } = createPostDto;

    const post = this.postRepository.create({
      title,
      preview,
      content,
      price,
      userId,
      seriesId,
      channelId,
      categoryId,
    });
    await this.postRepository.save(post);
    return post;
  }

  async findAll() {
    const posts = await this.postRepository.find();
    if (!posts) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    return posts;
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    //추가해야할거 : 내 포스트 전체조회

    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    const newPost = {
      ...post,
      ...updatePostDto,
    };
    const data = await this.postRepository.save(newPost);
    return data;
  }

  async delete(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('포스트 를 찾지못했습니다.');
    }
    if (post) {
      await this.postRepository.softDelete({ id });
    }
  }
}
