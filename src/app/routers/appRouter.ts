import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { activationSchema, AppSchema } from "../schemas/appSchema";
import { activationApp, registerApp } from "../services/appService";

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

// Activate user account
appRouter.get(
  "/activation",
  zValidator("query", activationSchema),
  async (c) => {
    const validated = c.req.valid("query");
    try {
      const result = await activationApp(validated.token);
      return c.json(
        { error: result.error, message: result.message },
        { status: result.status }
      );
    } catch (error) {
      console.error("Activation error:", error);
      return c.json({ error: true, message: "Internal error" }, 500);
    }
  }
);

export default appRouter;
