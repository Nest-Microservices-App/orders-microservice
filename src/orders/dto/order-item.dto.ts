import { IsNumber, IsPositive } from 'class-validator';

export class OrderItemDto {
  @IsNumber()
  @IsPositive()
  public productId: number;

  @IsNumber()
  @IsPositive()
  public quantity: number;

  @IsNumber()
  @IsPositive()
  public price: number;
}
