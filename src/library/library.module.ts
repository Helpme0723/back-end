import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from 'src/post/entities/post-like.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseList, PostLike, Comment])],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
