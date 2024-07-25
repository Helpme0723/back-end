import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Series } from './entities/series.entity';
import { Repository } from 'typeorm';
import { CreateSeriesDto } from './dtos//create-series-dto';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>
  ) {}

  async findAll() {
    const series = await this.seriesRepository.find();
    if (!series) {
      throw new NotFoundException('시리즈 를 찾을수 없습니다.');
    }
    return series;
  }

  async create(userId: number, createSeriesDto: CreateSeriesDto) {
    const { title, description, channelId } = createSeriesDto;

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
    const series = await this.seriesRepository.findOne({ where: { id } });

    return series;
  }
}
