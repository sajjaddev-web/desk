import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AppSchema } from "../schemas/appSchema";
import { registerApp } from "../services/appService";

const appRouter = new Hono();

appRouter.post("/register", zValidator("json", AppSchema), async (c) => {
  const validated = c.req.valid("json");
  try {
    const result = await registerApp(validated);
    return c.json(
      { error: result.error, data: result.data },
      { status: result.status }
    );
  } catch (error) {
    return c.json(
      { error: true, data: { errorMessage: "Internal Error" } },
      { status: 500 }
    );
  }
});

export default appRouter;
