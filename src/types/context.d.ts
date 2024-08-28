import { Context as HonoContext } from "hono";

declare module "hono" {
  interface Context {
    user?: any;
  }
}
