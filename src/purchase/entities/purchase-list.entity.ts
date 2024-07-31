import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity('purchase_lists')
@Unique(['userId', 'postId'])
export class PurchaseList {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column({ unsigned: true })
  postId: number;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.purchaseLists)
  user: User;

  @ManyToOne(() => Post, (post) => post.purchaseLists)
  post: Post;
}
