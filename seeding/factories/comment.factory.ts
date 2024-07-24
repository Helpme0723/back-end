import { Faker } from '@faker-js/faker';
import { Comment } from 'src/comment/entities/comment.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(Comment, async (faker: Faker) => {
  const comment = new Comment();
  console.log('되니 제발?4');
  comment.content = faker.lorem.paragraph(1);
  comment.likeCount = faker.number.int();

  return comment;
});
