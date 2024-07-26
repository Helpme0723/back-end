import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { VisibilityType } from './types/visibility.type';
import { Channel } from 'src/channel/entities/channel.entity';
import { Series } from 'src/series/entities/series.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>
  ) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    const { channelId, seriesId, ...postData } = createPostDto;

    const channel = await this.channelRepository.findOne({
      where: { userId },
    });

    if (channelId !== channel.id) {
      throw new UnauthorizedException('채널접근 권한이없습니다');
    }

    const series = await this.seriesRepository.findOne({
      where: { userId },
    });
    if (seriesId !== series.id) {
      throw new UnauthorizedException('시리즈에 접근 권한이 없습니다');
    }

    const post = this.postRepository.create({
      userId,
      channelId,
      seriesId,
      ...postData,
    });
    await this.postRepository.save(post);
    return post;
  }

  async findAll() {
    const posts = await this.postRepository.find({
      where: { visibility: VisibilityType.PUBLIC },
    });
    if (posts.length === 0) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }

    return posts;
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      relations: { comments: true },
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    if (post.visibility === VisibilityType.PRIVATE) {
      throw new NotFoundException('비공개 처리된 포스트입니다.');
    }

    return post;
  }

  async incrementViewCount(id: number) {
    await this.postRepository.increment({ id }, 'viewCount', 1);
  }

  async findMy(userId: number) {
    const post = await this.postRepository.find({
      where: { userId: userId },
    });

    if (!post) {
      throw new NotFoundException('포스트가 존재하지 않습니다.');
    }

    return post;
  }

  async update(userId: number, id: number, updatePostDto: UpdatePostDto) {
    const { channelId, ...etc } = updatePostDto;
    const post = await this.postRepository.findOne({
      where: { id, userId },
    });
    console.log(post);
    if (!post) {
      throw new NotFoundException('포스트를 찾을수 없습니다.');
    }
    const channel = await this.channelRepository.findOne({
      where: { userId },
    });

    console.log(channel);
    if (channelId !== channel.id) {
      throw new UnauthorizedException('채널접근 권한이없습니다');
    }
    const newPost = {
      ...post,
      ...etc,
      ...updatePostDto,
    };
    const data = await this.postRepository.save(newPost);
    return data;
  }

  async changeSeries(userId: number, id: number, seriesId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });
    if (post.userId !== userId) {
      throw new UnauthorizedException('접근권한이 없는 포스트입니다.');
    }
    const newPost = {
      ...post,
      seriesId,
    };
    const data = await this.postRepository.save(newPost);
    return data;
  }

  async delete(userId: number, id: number) {
    const post = await this.postRepository.findOne({
      where: { id, userId },
    });
    if (!post) {
      throw new NotFoundException('포스트 를 찾지못했습니다.');
    }
    if (post) {
      await this.postRepository.softDelete({ id });
    }
  }
}
