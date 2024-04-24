import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Order, PrismaClient } from '@prisma/client';
import { catchError, firstValueFrom } from 'rxjs';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto } from './dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { PRODUCT_SERVICE } from '../config';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger: Logger = new Logger('OrdersService');

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  };

  async create(createOrderDto: CreateOrderDto) {
    try {
      const productIds: number[] = createOrderDto.items.map(item => item.productId);

      const products: any[] = await firstValueFrom(
        this.productsClient.send({ cmd: 'validate_products' }, productIds),
      );

      const totalAmount: number = createOrderDto.items.reduce((acc, orderItem) => {
        const price: number = products.find(
          product => product.id === orderItem.productId
        ).price;

        return price * orderItem.quantity;
      }, 0);

      const totalItems: number = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: products.find(
                  (product) => product.id === orderItem.productId
                ).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: products.find(
            product => product.id === orderItem.productId
          ).name,
        })),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
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

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: {
        id,
      },
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      }
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });
    }

    const productIds: number[] = order.OrderItem.map((orderItem) => orderItem.productId);

    const products: any[] = await firstValueFrom(
      this.productsClient.send({ cmd: 'validate_products' }, productIds),
    );

    return {
      ...order,
      OrderItem: order.OrderItem.map((order) => ({
        ...order,
        name: products.find(
          product => product.id === order.productId,
        ).name,
      })),
    };
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
