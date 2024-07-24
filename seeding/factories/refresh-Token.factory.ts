import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(RefreshToken, async () => {
  const refreshToken = new RefreshToken();

  return refreshToken;
});
