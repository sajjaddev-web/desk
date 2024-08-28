import { sign, verify } from "hono/jwt";
import { IRegisterAppForm } from "../../interfaces/form/appForms";
import {
  IAppActivationResult,
  IAppRegisterResult,
} from "../../interfaces/result/appResult";
import { db } from "../../utils/db";
import * as bcrypt from "bcrypt";
import { sendActiveAppEmail } from "../../utils/email/activeApp";

// Generate tokens
const secretKey = process.env.APP_SECRET_KEY || "my-secret";
const activationKey = process.env.APP_TOKEN_Activation || "active-account";

export const registerApp = async (
  form: IRegisterAppForm
): Promise<IAppRegisterResult> => {
  try {
    // Check if the application already exists
    const appExist = await db.app.findFirst({
      where: { OR: [{ email: form.email }, { name: form.name }] },
    });

    if (appExist) {
      return {
        error: true,
        status: 401,
        data: {
          errorMessage:
            "Application with this information is already registered",
        },
      };
    }

    // Create new application
    const hashedPassword = await bcrypt.hash(form.password, 10);
    const app = await db.app.create({
      data: {
        name: form.name,
        email: form.email,
        password: hashedPassword,
      },
    });

    const token = await sign(
      { id: app.id, name: app.name, email: app.email },
      secretKey
    );

    const activeEmailToken = await sign(
      { activationId: app.id },
      activationKey
    );

    // Send activation email asynchronously
    setImmediate(() => {
      sendActiveAppEmail(app.email, activeEmailToken).catch((error) => {
        console.error("Error sending activation email:", error);
      });
    });

    // Return success result
    const { password, id, ...dataApp } = app;
    return {
      error: false,
      status: 201,
      data: { successMessage: "App created successfully", token, app: dataApp },
    };
  } catch (error) {
    console.error("Error registering app:", error);
    return {
      error: true,
      status: 500,
      data: { errorMessage: "Service Error" },
    };
  }
};

export const activationApp = async (
  token: string
): Promise<IAppActivationResult> => {
  try {
    const decoded = await verify(token, activationKey || "active-account");

    if (!decoded || typeof decoded.activationId !== "number") {
      return { error: true, message: "invalid token", status: 401 };
    }

    const app = await db.app.findUnique({
      where: { id: decoded.activationId },
    });

    if (app?.verify) {
      return {
        error: true,
        message: "Application already activated",
        status: 400,
      };
    }

    // Update user status to active
    await db.app.update({
      where: { id: decoded.activationId },
      data: { verify: true },
    });

    return {
      error: false,
      message: "Application activated successfully",
      status: 201,
    };
  } catch (error) {
    console.error("Activation error:", error);
    return { error: true, message: "Server Error", status: 500 };
  }
};
