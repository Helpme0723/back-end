import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Series } from './entities/series.entity';
import { Repository } from 'typeorm';
import { CreateSeriesDto } from './dtos//create-series-dto';
import { UpdateSeriesDto } from './dtos/update-series-dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { FindAllSeriesDto } from './dtos/find-all-series.dto';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>
  ) {}

  async findAll(findAllSeriesDto: FindAllSeriesDto) {
    const { channelId, page, limit, sort } = findAllSeriesDto;
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });
    if (channelId && !channel) {
      throw new NotFoundException('존재하지 않은 채널입니다');
    }

    const { items, meta } = await paginate<Series>(
      this.seriesRepository,
      { page, limit },
      {
        where: {
          deletedAt: null,
        },
        order: {
          createdAt: sort,
        },
      }
    );
    return {
      series: items.map((item) => ({
        id: item.id,
        userId: item.userId,
        channelId: item.channelId,
        title: item.title,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      meta,
    };
  }

  async create(userId: number, createSeriesDto: CreateSeriesDto) {
    const { title, description, channelId } = createSeriesDto;
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });
    if (!channel) {
      throw new NotFoundException('존재하지 않은 채널입니다.');
    }
    if (channel.userId !== userId) {
      throw new UnauthorizedException('본인의 채널에만 등록할수 있습니다.');
    }
    const series = this.seriesRepository.create({
      userId,
      title,
      description,
      channelId,
    });

    await this.seriesRepository.save(series);
    return series;
  }

  async findOne(id: number) {
    const series = await this.seriesRepository.findOne({
      where: {
        id,
      },
      relations: {
        posts: {
          category: true,
        },
      },
    });

    if (!series) {
      throw new NotFoundException('해당시리즈가 존재하지 않습니다');
    }

    return series;
  }
  /* findOne과 readOne의 차이? = join으로 가져오는 포스트가
   * public만 있냐, private도 있냐의 차이
   */
  async readOne(userId: number, id: number) {
    const series = await this.seriesRepository.findOne({
      relations: {
        posts: {
          category: true,
        },
      },
      where: { userId, id },
    });

    if (!series) {
      throw new NotFoundException('시리즈를 찾지못했습니다');
    }

    series.posts = series.posts.splice(0, 5);

    return series;
  }

  async update(id: number, userId: number, updateSeriesDto: UpdateSeriesDto) {
    if (!id) {
      throw new BadRequestException('시리즈아이디를 입력해주세요');
    }
    //const { title, description, channelId } = updateSeriesDto;
    const series = await this.seriesRepository.findOne({
      where: { id, userId },
    });
    if (!series) {
      throw new NotFoundException('시리즈를 찾을수 없습니다.');
    }
    //내채널이 아닐때 오류떤져쥬기
    const channel = await this.channelRepository.findOne({
      where: { userId, id: updateSeriesDto.channelId },
    });
    if (!channel) {
      throw new NotFoundException('채널을 찾을수 없습니다.');
    }

    // if (!title || !description || !channelId) {
    //   throw new BadRequestException('수정할내용을 입력해주세요');
    // }
    const newSeries = {
      ...series,
      ...updateSeriesDto,
    };
    await this.seriesRepository.save(newSeries);

    return newSeries;
  }

  async delete(id: number, userId: number) {
    if (!id) {
      throw new BadRequestException('시리즈ID 를 입력해주세요');
    }
    const series = await this.seriesRepository.findOne({
      where: { id, userId },
    });
    if (!series) {
      throw new NotFoundException('시리즈를 찾아올수없습니다');
    }
    await this.seriesRepository.softDelete(id);
  }

  async findAllMySeries(userId: number, findAllMySeries: FindAllSeriesDto) {
    const { channelId, page, limit, sort } = findAllMySeries;

    const channel = await this.channelRepository.findOne({
      where: { id: channelId, userId },
    });
    if (!channel) {
      throw new NotFoundException('존재하지 않은 채널입니다.');
    }

    const { items, meta } = await paginate<Series>(
      this.seriesRepository,
      { page, limit },
      { where: { userId, channelId }, order: { createdAt: sort } }
    );
    return {
      series: items.map((item) => ({
        id: item.id,
        userId: item.userId,
        channelId: item.channelId,
        title: item.title,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      meta,
    };
  }
}
