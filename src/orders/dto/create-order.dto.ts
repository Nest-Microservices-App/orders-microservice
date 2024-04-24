import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  public items: OrderItemDto[];

  // @IsNumber()
  // @IsPositive()
  // public totalAmount: number;

  // @IsNumber()
  // @IsPositive()
  // public totalItems: number;

  // @IsEnum(OrderStatusList, {
  //   message: `Possible status values are ${OrderStatusList}`,
  // })
  // @IsOptional()
  // public status: OrderStatus = OrderStatus.PENDING;

  // @IsBoolean()
  // @IsOptional()
  // public paid: boolean = false;
}