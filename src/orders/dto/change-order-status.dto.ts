import { OrderStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

import { OrderStatusList } from '../enum/order.enum';

export class ChangeOrderStatusDto {
  @IsUUID(4)
  public id: string;

  @IsEnum(OrderStatusList, {
    message: `Valid status are ${OrderStatusList}`,
  })
  public status: OrderStatus;
}