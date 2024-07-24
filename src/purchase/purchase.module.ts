import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseList } from './entities/purchase-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseList])],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
