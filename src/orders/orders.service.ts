import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Order, PrismaClient } from '@prisma/client';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto } from './dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger: Logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  };

  create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.order.create({
      data: createOrderDto,
    });
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages: number = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      }
    });

    const currentPage: number = orderPaginationDto.page;
    const perPage: number = orderPaginationDto.limit;

    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage), 
      },
    };
  }

  async findOne(id: string): Promise<Order> {
    const order: Order = await this.order.findFirst({
      where: {
        id,
      },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });
    }

    return order;
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto): Promise<Order> {
    const { id, status } = changeOrderStatusDto;

    const order: Order = await this.findOne(id);

    if (order.status === status) {
      return order;
    };

    return await this.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}
