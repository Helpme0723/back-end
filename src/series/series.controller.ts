import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { SeriesService } from './series.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateSeriesDto } from './dtos/create-series-dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSeriesDto } from './dtos/update-series-dto';

@ApiTags('6.시리즈')
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

  /**
   * 시리즈 상세조회
   * @param id
   * @returns
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.seriesService.findOne(id);

    return {
      status: HttpStatus.OK,
      message: '시리즈 불러오기를 성공했습니다',
      data,
    };
  }

  /**
   * 시리즈 수정
   * @param user
   * @param id
   * @param updateSeriesDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @UserInfo() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSeriesDto: UpdateSeriesDto
  ) {
    const userId = user.id;
    const data = await this.seriesService.update(id, userId, updateSeriesDto);

    return {
      status: HttpStatus.OK,
      message: '시리즈를 수정하였습니다',
      data,
    };
  }

  /**
   * 시리즈삭제
   * @param user
   * @param id
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@UserInfo() user: User, @Param('id', ParseIntPipe) id: number) {
    const userId = user.id;
    const data = await this.seriesService.delete(id, userId);

    return {
      status: HttpStatus.OK,
      message: '시리즈를 삭제하였습니다',
      data,
    };
  }

  /**
   * 내시리즈 조회
   * @param user
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async findAllMySeries(@UserInfo() user: User) {
    const userId = user.id;
    const data = await this.seriesService.findAllMySeries(userId);

    return {
      status: HttpStatus.OK,
      message: '내 시리즈 들을 조회하였습니다',
      data,
    };
  }
}
