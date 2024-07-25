import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { SeriesService } from './series.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateSeriesDto } from './dtos/create-series-dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('시리즈')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  /**
   * 시리즈 전체조회
   * @returns
   */
  @Get()
  async findAll() {
    const data = await this.seriesService.findAll();
    return {
      status: HttpStatus.OK,
      message: '시리즈를 조회하였습니다.',
      data,
    };
  }

  /**
   * 시리즈 생성
   * @param user
   * @param createSeriesDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@UserInfo() user: User, @Body() createSeriesDto: CreateSeriesDto) {
    const userId = user.id;

    const data = await this.seriesService.create(userId, createSeriesDto);
    return {
      status: HttpStatus.CREATED,
      message: '시리즈를 생성하였습니다.',
      data,
    };
  }
}
