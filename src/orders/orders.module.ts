import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { NatsModule } from '../transports/nats.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    NatsModule,
  ],
})
export class OrdersModule { }
