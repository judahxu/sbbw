import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { orders, rechargeOrders, appleIdOrders, accelerationOrders,  appleAccounts, configs,serverAccounts,paymentRecords } from "~/server/db/schema";
import { getProductName, getProductDescription, getOrderDetails } from "~/lib/utils";

// 输入验证Schema
const OrderStatusSchema = z.enum([
  'pending_payment',
  'paid',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded'
]);

const createOrderSchema = z.object({
  type: z.enum(['acceleration', 'appleId', 'recharge']),
  amount: z.number(),
  // 加速服务特定字段
  plan: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  // 充值服务特定字段
  usdAmount: z.number().optional(),
  exchangeRate: z.number().optional(),
  // appliedAccount: z.string().optional(),
});

const OrderTypeSchema = z.enum(['recharge', 'appleId', 'acceleration']);

const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

const OrderFilterSchema = z.object({
  type: OrderTypeSchema.optional(),
  status: OrderStatusSchema.optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// 处理订单的输入Schema
const ProcessRechargeSchema = z.object({
  orderId: z.string(),
  giftCardCode: z.string(),
  remark: z.string().optional(),
});

const ProcessAppleIdSchema = z.object({
  orderId: z.string(),
  email: z.string().email(),
  password: z.string(),
  remark: z.string().optional(),
});

const ProcessAccelerationSchema = z.object({
  orderId: z.string(),
  configuration: z.string().optional(),
  remark: z.string().optional(),
});

export const orderRouter = createTRPCRouter({
  // 获取订单列表
  getOrders: protectedProcedure
    .input(PaginationSchema.merge(OrderFilterSchema))
    .query(async ({ ctx, input }) => {
      const { page, pageSize, type, status, search, startDate, endDate } = input;
      const offset = (page - 1) * pageSize;

      // 构建where条件
      const whereConditions = [];
      if (type) whereConditions.push(eq(orders.type, type));
      if (status) whereConditions.push(eq(orders.status, status));
      if (startDate) whereConditions.push(sql`created_at >= ${startDate}`);
      if (endDate) whereConditions.push(sql`created_at <= ${endDate}`);
      if (search) {
        whereConditions.push(
          sql`id LIKE ${`%${search}%`} OR user_id LIKE ${`%${search}%`}`
        );
      }

      // 查询订单
      const [orderList, totalCount] = await Promise.all([
        ctx.db.query.orders.findMany({
          where: and(...whereConditions),
          limit: pageSize,
          offset,
          orderBy: (orders, { desc }) => [desc(orders.createdAt)],
          with: {
            user: true,
            rechargeOrder: true,
            appleIdOrder: true,
            accelerationOrder: true,
          },
        }),
        ctx.db.query.orders.findMany({
          where: and(...whereConditions),
          columns: {
            id: true,
          },
        }).then(results => results.length),
      ]);

      return {
        orders: orderList,
        total: totalCount,
        page,
        pageSize,
      };
    }),

  

    // 获取订单详情
    getDetails: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          user: true,
          rechargeOrder: true,
          appleIdOrder: true,
          accelerationOrder: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "订单不存在",
        });
      }

      // Verify order belongs to current user
      if (order.userId !== ctx.session.user.id && ctx.session.user.role !== 'admin') {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权访问此订单",
        });
      }

      // Format product information based on order type
      const product = {
        name: '',
        description: ''
      };

      switch (order.type) {
        case 'acceleration':
          const plan = order.accelerationOrder?.plan;
          product.name = `加速服务-${
            plan === 'monthly' ? '月付' :
            plan === 'quarterly' ? '季付' : '年付'
          }套餐`;
          product.description = `${
            plan === 'monthly' ? '1个月' :
            plan === 'quarterly' ? '3个月' : '12个月'
          }加速服务`;
          break;

        case 'appleId':
          product.name = '美区账号';
          product.description = '独立账号，永久使用';
          break;

        case 'recharge':
          if (order.rechargeOrder) {
            product.name = '充值服务';
            product.description = `${order.rechargeOrder.usdAmount}美元充值`;
          }
          break;
      }

      return {
        ...order,
        product,
      };
    }),

    // Update order status
    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.string(),
        status: OrderStatusSchema,
        remark: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orderId, status, remark } = input;

        return await ctx.db.transaction(async (tx) => {
          // 获取当前订单
          const order = await tx.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
              appleIdOrder: true,
              accelerationOrder: true,
              rechargeOrder: true,
            },
          });

          if (!order) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "订单不存在",
            });
          }

          // 验证权限
          if (order.userId !== ctx.session.user.id && ctx.session.user.role !== 'admin') {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "无权操作此订单",
            });
          }

          // 验证状态转换
          const validTransitions: Record<string, string[]> = {
            'pending_payment': ['paid', 'cancelled'],
            'paid': ['processing', 'failed', 'refunded'],
            'processing': ['completed', 'failed'],
            'completed': ['refunded'],
            'failed': ['processing'],
            'cancelled': [],
            'refunded': [],
          };

          if (!validTransitions[order.status]?.includes(status)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "无效的状态变更",
            });
          }

          // 更新订单状态
          await tx.update(orders)
            .set({
              status,
              remark: remark ?? order.remark,
              updatedAt: new Date(),
              ...(status === 'paid' ? {
                processedAt: new Date(),
                processedBy: ctx.session.user.id,
              } : {}),
            })
            .where(eq(orders.id, orderId));

          // 如果状态变更为已支付，进行相应处理
          if (status === 'paid') {
            switch (order.type) {
              case 'appleId':
                // 尝试自动分配账号
                const availableAccount = await tx.query.appleAccounts.findFirst({
                  where: eq(appleAccounts.status, 'available'),
                });

                if (availableAccount) {
                  await tx.update(appleAccounts)
                    .set({
                      status: 'sold',
                      orderId: order.id,
                      soldAt: new Date(),
                    })
                    .where(eq(appleAccounts.id, availableAccount.id));

                  await tx.update(appleIdOrders)
                    .set({
                      email: availableAccount.email,
                      password: availableAccount.password,
                    })
                    .where(eq(appleIdOrders.orderId, order.id));

                  await tx.update(orders)
                    .set({
                      status: 'completed',
                      processedAt: new Date(),
                      processedBy: 'system',
                    })
                    .where(eq(orders.id, order.id));
                } else {
                  await tx.update(orders)
                    .set({
                      status: 'processing',
                      remark: '无可用账号，等待手动处理',
                    })
                    .where(eq(orders.id, order.id));
                }
                break;

              case 'acceleration':
                // 尝试自动分配服务器
                const availableServer = await tx.query.serverAccounts.findFirst({
                  where: eq(serverAccounts.status, 'available'),
                });

                if (availableServer) {
                  const duration = order.accelerationOrder?.plan === 'monthly' ? 30 :
                                order.accelerationOrder?.plan === 'quarterly' ? 90 : 365;

                  await tx.update(serverAccounts)
                    .set({
                      status: 'assigned',
                      assignedTo: order.userId,
                      assignmentStart: new Date(),
                      duration: duration,
                      assignmentEnd: sql`DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ${duration} DAY)`,
                    })
                    .where(eq(serverAccounts.id, availableServer.id));

                  await tx.update(accelerationOrders)
                    .set({
                      configuration: availableServer.config,
                      startDate: new Date(),
                    })
                    .where(eq(accelerationOrders.orderId, order.id));

                  await tx.update(orders)
                    .set({
                      status: 'completed',
                      processedAt: new Date(),
                      processedBy: 'system',
                    })
                    .where(eq(orders.id, order.id));
                } else {
                  await tx.update(orders)
                    .set({
                      status: 'processing',
                      remark: '无可用服务器，等待手动处理',
                    })
                    .where(eq(orders.id, order.id));
                }
                break;

              case 'recharge':
                // 充值订单需要手动处理
                await tx.update(orders)
                  .set({
                    status: 'processing',
                    remark: '等待手动处理充值',
                  })
                  .where(eq(orders.id, order.id));
                break;
            }
          }

          return {
            success: true,
            message: "订单状态更新成功",
          };
        });
      }),
  
    // Cancel order
    cancelOrder: protectedProcedure
      .input(z.object({
        orderId: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orderId, reason } = input;

        const order = await ctx.db.query.orders.findFirst({
          where: eq(orders.id, orderId),
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "订单不存在",
          });
        }

        // Verify order belongs to current user or user is admin
        if (order.userId !== ctx.session.user.id && ctx.session.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "无权取消此订单",
          });
        }

        // Check if order can be cancelled
        if (!['pending_payment', 'paid'].includes(order.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "当前订单状态无法取消",
          });
        }

        // Update order status
        await ctx.db.update(orders)
          .set({
            status: 'cancelled',
            remark: reason ?? order.remark,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderId));

        return {
          success: true,
          message: "订单取消成功",
        };
      }),
    // 获取订单统计
    getOrderStats: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [todayOrders, pendingOrders, monthlyIncome] = await Promise.all([
        // 今日订单数
        ctx.db.query.orders.findMany({
          where: sql`created_at >= ${today}`,
          columns: {
            id: true,
          },
        }).then(results => results.length),

        // 待处理订单数
        ctx.db.query.orders.findMany({
          where: eq(orders.status, 'paid'),
          columns: {
            id: true,
          },
        }).then(results => results.length),

        // 本月收入
        ctx.db.select({
          total: sql<number>`SUM(amount)`,
        })
        .from(orders)
        .where(and(
          eq(orders.status, 'completed'),
          sql`MONTH(created_at) = MONTH(CURRENT_DATE())`,
          sql`YEAR(created_at) = YEAR(CURRENT_DATE())`
        ))
        .then(result => result[0]?.total ?? 0),
      ]);

      return {
        today: todayOrders,
        pending: pendingOrders,
        monthlyIncome,
      };
    }),

    // 处理充值订单
    processRechargeOrder: protectedProcedure
      .input(ProcessRechargeSchema)
      .mutation(async ({ ctx, input }) => {
        const { orderId, giftCardCode, remark } = input;

        // 开启事务
        return await ctx.db.transaction(async (tx) => {
          // 检查订单状态
          const order = await tx.query.orders.findFirst({
            where: and(
              eq(orders.id, orderId),
              eq(orders.type, 'recharge'),
            ),
          });

          if (!order) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: '订单状态不正确',
            });
          }

          // 更新订单状态
          await tx.update(orders)
            .set({
              status: 'completed',
              processedBy: ctx.session.user.id,
              processedAt: new Date(),
              remark,
            })
            .where(eq(orders.id, orderId));

          // 更新充值订单信息
          await tx.update(rechargeOrders)
            .set({
              giftCardCode,
            })
            .where(eq(rechargeOrders.orderId, orderId));

          return { success: true };
        });
      }),

    // 处理美区账号订单
    processAppleIdOrder: protectedProcedure
      .input(ProcessAppleIdSchema)
      .mutation(async ({ ctx, input }) => {
        const { orderId, email, password, remark } = input;

        return await ctx.db.transaction(async (tx) => {
          const order = await tx.query.orders.findFirst({
            where: and(
              eq(orders.id, orderId),
              eq(orders.type, 'appleId'),
            ),
          });

          if (!order) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: '订单状态不正确',
            });
          }

          await tx.update(orders)
            .set({
              status: 'completed',
              processedBy: ctx.session.user.id,
              processedAt: new Date(),
              remark,
            })
            .where(eq(orders.id, orderId));

          await tx.update(appleIdOrders)
            .set({
              email,
              password,
            })
            .where(eq(appleIdOrders.orderId, orderId));

          return { success: true };
        });
      }),

    // 处理加速服务订单
    processAccelerationOrder: protectedProcedure
    .input(ProcessAccelerationSchema)
    .mutation(async ({ ctx, input }) => {
      const { orderId, configuration, remark } = input;
  
      return await ctx.db.transaction(async (tx) => {
        // Get order with acceleration details
        const order = await tx.query.orders.findFirst({
          where: and(
            eq(orders.id, orderId),
            eq(orders.type, 'acceleration'),
          ),
          with: {
            accelerationOrder: true,
          },
        });
  
        if (!order?.accelerationOrder) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '订单状态或类型不正确',
          });
        }
  
        // Calculate duration based on plan
        const duration = order.accelerationOrder.plan === 'monthly' ? 30 :
                        order.accelerationOrder.plan === 'quarterly' ? 90 : 365;
  
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);
  
        // Update order status
        await tx.update(orders)
          .set({
            status: 'completed',
            processedBy: ctx.session.user.id,
            processedAt: startDate,
            remark,
          })
          .where(eq(orders.id, orderId));
  
        // Update acceleration order details
        await tx.update(accelerationOrders)
          .set({
            configuration,
            startDate,
            endDate,
          })
          .where(eq(accelerationOrders.orderId, orderId));
  
        // Update server account if configuration matches
        if (configuration) {
          await tx.update(serverAccounts)
            .set({
              status: 'assigned',
              assignedTo: order.userId,
              assignmentStart: startDate,
              duration,
              assignmentEnd: endDate,
            })
            .where(eq(serverAccounts.config, configuration));
        }
  
        return { success: true };
      });
    }),

  // 取消订单
  // cancelOrder: protectedProcedure
  //   .input(z.object({
  //     orderId: z.string(),
  //     reason: z.string().optional(),
  //   }))
  //   .mutation(async ({ ctx, input }) => {
  //     const { orderId, reason } = input;

  //     const order = await ctx.db.query.orders.findFirst({
  //       where: eq(orders.id, orderId),
  //     });

  //     if (!order || !['pending_payment', 'paid'].includes(order.status)) {
  //       throw new TRPCError({
  //         code: 'BAD_REQUEST',
  //         message: '订单无法取消',
  //       });
  //     }

  //     await ctx.db.update(orders)
  //       .set({
  //         status: 'cancelled',
  //         remark: reason,
  //         updatedAt: new Date(),
  //       })
  //       .where(eq(orders.id, orderId));

  //     return { success: true };
  //   }),

    createOrder: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      // 直接创建订单，使用传入的金额
      const orderId = 'ORD' + new Date().getTime().toString();
      
      await ctx.db.transaction(async (tx) => {
        await tx.insert(orders).values({
          id: orderId,
          type: input.type,
          userId: ctx.session.user.id,
          amount: input.amount.toFixed(2),
          status: 'pending_payment',
        });
  
        switch (input.type) {
          case 'acceleration':
            await tx.insert(accelerationOrders).values({
              orderId,
              plan: input.plan!,
            });
            break;
          
          case 'appleId':
            await tx.insert(appleIdOrders).values({
              orderId,
            });
            break;
          
          case 'recharge':
            if (!input.usdAmount || !input.exchangeRate) {
              throw new Error('Missing required fields for recharge order');
            }
            await tx.insert(rechargeOrders).values({
              orderId,
              usdAmount: input.usdAmount?.toFixed(2),
              exchangeRate: input.exchangeRate?.toFixed(4),
              // appliedAccount: input.appliedAccount!,
            });
            break;
        }
      });
  
      return { orderId };
    }),

    // Process paid order
    processPaidOrder: protectedProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orderId } = input;

      return await ctx.db.transaction(async (tx) => {
        // Get order details with type-specific info
        const order = await tx.query.orders.findFirst({
          where: eq(orders.id, orderId),
          with: {
            appleIdOrder: true,
            accelerationOrder: true,
            rechargeOrder: true,
          },
        });

        if (!order || order.status !== 'paid') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '订单状态不正确',
          });
        }

        // Handle different order types
        switch (order.type) {
          case 'appleId':
            // Try to auto-assign Apple ID
            const availableAccount = await tx.query.appleAccounts.findFirst({
              where: eq(appleAccounts.status, 'available'),
            });

            if (availableAccount) {
              // Auto assign account
              await tx.update(appleAccounts)
                .set({
                  status: 'sold',
                  orderId: order.id,
                  soldAt: new Date(),
                })
                .where(eq(appleAccounts.id, availableAccount.id));

              await tx.update(appleIdOrders)
                .set({
                  email: availableAccount.email,
                  password: availableAccount.password,
                })
                .where(eq(appleIdOrders.orderId, order.id));

              // Update order status to completed
              await tx.update(orders)
                .set({
                  status: 'completed',
                  processedAt: new Date(),
                  processedBy: 'system',
                })
                .where(eq(orders.id, order.id));

              return {
                status: 'completed',
                message: '账号已自动分配',
              };
            } else {
              // Mark for manual processing
              await tx.update(orders)
                .set({
                  status: 'processing',
                  remark: '无可用账号，等待手动处理',
                })
                .where(eq(orders.id, order.id));

              return {
                status: 'processing',
                message: '无可用账号，已加入手动处理队列',
              };
            }

          case 'acceleration':
            // Similar logic for acceleration service
            const availableServer = await tx.query.serverAccounts.findFirst({
              where: eq(serverAccounts.status, 'available'),
            });

            if (availableServer) {
              // Auto assign server
              await tx.update(serverAccounts)
                .set({
                  status: 'assigned',
                  assignedTo: order.userId,
                  assignmentStart: new Date(),
                  duration: order.accelerationOrder?.plan === 'monthly' ? 30 :
                          order.accelerationOrder?.plan === 'quarterly' ? 90 : 365,
                  assignmentEnd: sql`DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ${
                    order.accelerationOrder?.plan === 'monthly' ? 30 :
                    order.accelerationOrder?.plan === 'quarterly' ? 90 : 365
                  } DAY)`,
                })
                .where(eq(serverAccounts.id, availableServer.id));

              await tx.update(accelerationOrders)
                .set({
                  configuration: availableServer.config,
                  startDate: new Date(),
                })
                .where(eq(accelerationOrders.orderId, order.id));

              await tx.update(orders)
                .set({
                  status: 'completed',
                  processedAt: new Date(),
                  processedBy: 'system',
                })
                .where(eq(orders.id, order.id));

              return {
                status: 'completed',
                message: '服务器已自动分配',
              };
            } else {
              // Mark for manual processing
              await tx.update(orders)
                .set({
                  status: 'processing',
                  remark: '无可用服务器，等待手动处理',
                })
                .where(eq(orders.id, order.id));

              return {
                status: 'processing',
                message: '无可用服务器，已加入手动处理队列',
              };
            }

          case 'recharge':
            // Recharge orders always need manual processing
            await tx.update(orders)
              .set({
                status: 'processing',
                remark: '等待手动处理充值',
              })
              .where(eq(orders.id, order.id));

            return {
              status: 'processing',
              message: '已加入充值处理队列',
            };

          default:
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: '未支持的订单类型',
            });
        }
      });
    }),

    queryPaymentStatus: protectedProcedure
    .input(z.object({
      paymentNo: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const payment = await ctx.db.query.paymentRecords.findFirst({
        where: eq(paymentRecords.paymentNo, input.paymentNo),
        with: {
          order: true,
        },
      });
      return {
        status: payment?.status,
        paidAt: payment?.paidAt,
      };
    }),


    // 用户订单列表查询
    getUserOrders: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(50).default(10),
      type: z.enum(['acceleration', 'appleId', 'recharge', 'all']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize, type } = input;
      const offset = (page - 1) * pageSize;

      // 构建查询条件
      const whereConditions = [
        eq(orders.userId, ctx.session.user.id)
      ];

      if (type && type !== 'all') {
        whereConditions.push(eq(orders.type, type));
      }

      // 查询订单
      const [orderList, totalCount] = await Promise.all([
        ctx.db.query.orders.findMany({
          where: and(...whereConditions),
          limit: pageSize,
          offset,
          orderBy: (orders, { desc }) => [desc(orders.createdAt)],
          with: {
            rechargeOrder: true,
            appleIdOrder: true,
            accelerationOrder: true,
          },
        }),
        ctx.db.query.orders.findMany({
          where: and(...whereConditions),
          columns: {
            id: true,
          },
        }).then(results => results.length),
      ]);

      // 格式化返回数据以匹配前端期望的结构
      const formattedOrders = orderList.map(order => ({
        id: order.id,
        type: order.type,
        status: order.status,
        amount: Number(order.amount),
        createdAt: order.createdAt,
        processedAt: order.processedAt,
        // 根据订单类型返回特定信息
        appleIdOrder: order.appleIdOrder,
        accelerationOrder: order.accelerationOrder,
        rechargeOrder: order.rechargeOrder,
      }));

      return {
        orders: formattedOrders,
        total: totalCount,
        currentPage: page,
        pageSize,
      };
    }),

    
});


