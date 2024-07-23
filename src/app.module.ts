import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configModuleValidationSchema } from './configs/env-validation.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleOptions } from './configs/database.config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      validationSchema: configModuleValidationSchema
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
