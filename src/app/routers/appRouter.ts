import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  activationSchema,
  AppLoginSchema,
  AppRegisterSchema,
  AppUpdateSchema,
} from "../schemas/appSchema";
import {
  activationApp,
  deleteApp,
  loginApp,
  registerApp,
  updateApp,
} from "../services/appService";
import { authAppMiddleware } from "../../middlewares/authMiddleware";

const appRouter = new Hono();

appRouter.post(
  "/register",
  zValidator("json", AppRegisterSchema),
  async (c) => {
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
  }
);

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

appRouter.post("/login", zValidator("json", AppLoginSchema), async (c) => {
  const validated = c.req.valid("json");
  try {
    const result = await loginApp(validated);
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

appRouter.put(
  "",
  zValidator("json", AppUpdateSchema),
  authAppMiddleware,
  async (c) => {
    const validated = c.req.valid("json");
    try {
      const user = c.user; // Get the user from the context
      const result = await updateApp(user.id, validated);
      return c.json(
        { error: result.error, data: result.data },
        { status: result.status }
      );
    } catch (error) {
      console.error("Activation error:", error);
      return c.json({ error: true, message: "Internal error" }, 500);
    }
  }
);

appRouter.delete("", authAppMiddleware, async (c) => {
  try {
    const user = c.user; // Get the user from the context
    const result = await deleteApp(user.id);
    return c.json(
      { error: result.error, message: result.message },
      { status: result.status }
    );
  } catch (error) {
    console.error("Activation error:", error);
    return c.json({ error: true, message: "Internal error" }, 500);
  }
});

export default appRouter;
