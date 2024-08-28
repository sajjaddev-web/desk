import { Context, Next } from "hono";
import { db } from "../utils/db";
import { verify } from "hono/jwt";

const secretKey = process.env.APP_SECRET_KEY || "my-secret";

export const authAppMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json(
        { error: true, message: "Authorization header missing" },
        401
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return c.json({ error: true, message: "Token missing" }, 401);
    }

    const decoded: any = verify(token, secretKey);
    if (!decoded || !decoded.id) {
      return c.json({ error: true, message: "Invalid token" }, 401);
    }

    const user = await db.app.findUnique({ where: { id: decoded.id } });
    if (!user || !user.verify) {
      return c.json(
        { error: true, message: "User not found or not activated" },
        401
      );
    }

    c.set("user", user);

    await next();
  } catch (error) {
    console.error("Authentication error:", error);
    return c.json({ error: true, message: "Internal Server Error" }, 500);
  }
};
