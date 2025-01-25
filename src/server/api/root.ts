import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from '~/server/api/routers/auth';
import { serviceAccountRouter } from './routers/serviceAccount';
import { adminRouter } from "./routers/admin";
import { apiKeyRouter } from "./routers/apiKey";
import { acceleratorRouter } from "./routers/accelerator";
import { bundleRouter } from "./routers/bundle";
import { productRouter } from "./routers/product";
import { orderRouter } from "./routers/order";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  serviceAccount: serviceAccountRouter,
  admin: adminRouter,
  apiKey: apiKeyRouter,
  accelerator: acceleratorRouter,
  bundle: bundleRouter,
  product: productRouter,
  order: orderRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
