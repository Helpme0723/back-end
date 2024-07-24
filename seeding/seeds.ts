import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import UserSeeder from './seeds/user.seeder';
import userFactory from './factories/user.factory';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/post/entities/category.entity';
import categoryFactory from './factories/category.factory';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import refreshTokenFactory from './factories/refresh-Token.factory';
import { Channel } from 'src/channel/entities/channel.entity';
import channelFactory from './factories/channel.factory';
import { CommentLike } from 'src/comment/entities/comment-like.entity';
import commentLikeFactory from './factories/comment-like.factory';
import { Comment } from 'src/comment/entities/comment.entity';
import commentFactory from './factories/comment.factory';
import { PointHistory } from 'src/point/entities/point-history.entity';
import pointFactory from './factories/point.factory';
import { Post } from 'src/post/entities/post.entity';
import postFactory from './factories/post.factory';
import { PurchaseList } from 'src/purchase/entities/purchase-list.entity';
import purchaseFactory from './factories/purchase.factory';
import { Series } from 'src/series/entities/series.entity';
import seriesFactory from './factories/series.factory';
import { Subscribe } from 'src/subscribe/entities/subscribe.entity';
import subscribeFactory from './factories/subscribe.factory';
import { Tag } from 'src/post/entities/tag.entity';
import tagFactory from './factories/tag.factory';
import CategorySeeder from './seeds/category.seeder';
import ChannelSeeder from './seeds/channel.seeder';
import CommentSeeder from './seeds/comment.seeder';
import PointHistorySeeder from './seeds/point.seeder';
import PostSeeder from './seeds/post.seeder';
import PurchaseListSeeder from './seeds/purchase-list.seeder';
import SeriesSeeder from './seeds/series.seeder';
import SubscribeSeeder from './seeds/subscribe.seeder';
import TagSeeder from './seeds/tag.seeder';
import { PostLike } from 'src/post/entities/post-like.entity';
import PostLikeSeeder from './seeds/post-like.seeder';
import postLikeFactory from './factories/post-like.factory';

dotenv.config();

(async () => {
  const options: DataSourceOptions & SeederOptions = {
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: JSON.parse(process.env.DB_SYNC),
    entities: [
      User,
      Category,
      RefreshToken,
      Channel,
      CommentLike,
      Comment,
      PointHistory,
      Series,
      Post,
      PostLike,
      PurchaseList,
      Subscribe,
      Tag,
    ],
    seeds: [
      UserSeeder,
      CategorySeeder,
      ChannelSeeder,
      CommentSeeder,
      PointHistorySeeder,
      SeriesSeeder,
      PostSeeder,
      PostLikeSeeder,
      PurchaseListSeeder,
      SubscribeSeeder,
      TagSeeder,
    ],
    factories: [
      userFactory,
      categoryFactory,
      refreshTokenFactory,
      channelFactory,
      commentLikeFactory,
      commentFactory,
      pointFactory,
      seriesFactory,
      postFactory,
      postLikeFactory,
      purchaseFactory,
      subscribeFactory,
      tagFactory,
    ],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  await runSeeders(dataSource);
  console.log('seeding 완료');
  process.exit();
})();
