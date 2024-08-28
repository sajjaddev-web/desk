import { sign, verify } from "hono/jwt";
import {
  ILoginAppForm,
  IRegisterAppForm,
  IUpdateAppForm,
} from "../../interfaces/form/appForms";
import {
  IAppActivationResult,
  IAppRegisterAndLoginResult,
  IAppDeleteResult,
} from "../../interfaces/result/appResult";
import { db } from "../../utils/db";
import * as bcrypt from "bcrypt";
import { sendActiveAppEmail } from "../../utils/email/activeApp";
import { JWTPayload } from "hono/utils/jwt/types";

// Generate tokens
const secretKey = process.env.APP_SECRET_KEY || "my-secret";
const activationKey = process.env.APP_TOKEN_Activation || "active-account";

const generateToken = async (payload: JWTPayload, key: string) =>
  await sign(payload, key);

export const registerApp = async (
  form: IRegisterAppForm
): Promise<IAppRegisterAndLoginResult> => {
  try {
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

    const hashedPassword = await bcrypt.hash(form.password, 10);
    const app = await db.app.create({
      data: { name: form.name, email: form.email, password: hashedPassword },
    });

    const token = await generateToken(
      { id: app.id, name: app.name, email: app.email },
      secretKey
    );
    const activeEmailToken = await generateToken(
      { activationId: app.id },
      activationKey
    );

    setImmediate(() =>
      sendActiveAppEmail(app.email, activeEmailToken).catch(console.error)
    );

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
    const decoded = await verify(token, activationKey);
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

export const loginApp = async (
  form: ILoginAppForm
): Promise<IAppRegisterAndLoginResult> => {
  try {
    const app = await db.app.findFirst({
      where: { OR: [{ email: form.identifier }, { name: form.identifier }] },
    });
    if (!app) {
      return {
        error: true,
        data: { errorMessage: "email or password not correct" },
        status: 400,
      };
    }

    const passCheck = await bcrypt.compare(form.password, app.password);
    if (!passCheck) {
      return {
        error: true,
        data: { errorMessage: "email or password not correct" },
        status: 400,
      };
    }

    const token = await generateToken(
      { id: app.id, name: app.name, email: app.email },
      secretKey
    );
    if (!app.verify) {
      const activeEmailToken = await generateToken(
        { activationId: app.id },
        activationKey
      );
      setImmediate(() =>
        sendActiveAppEmail(app.email, activeEmailToken).catch(console.error)
      );
    }

    const { password, id, ...dataApp } = app;
    return {
      error: false,
      status: 201,
      data: { successMessage: "App Login successfully", token, app: dataApp },
    };
  } catch (error) {
    console.error("Error logging in app:", error);
    return {
      error: true,
      status: 500,
      data: { errorMessage: "Service Error" },
    };
  }
};

export const updateApp = async (
  id: number,
  form: IUpdateAppForm
): Promise<IAppRegisterAndLoginResult> => {
  try {
    const app = await db.app.findUnique({ where: { id } });
    if (!app) {
      return {
        error: true,
        data: { errorMessage: "Application not found" },
        status: 404,
      };
    }

    if (!form.name && !form.password) {
      return {
        error: true,
        status: 400,
        data: { errorMessage: "No changes requested" },
      };
    }

    const updatedData: any = {};
    if (form.name) {
      const nameExist = await db.app.findFirst({ where: { name: form.name } });
      if (nameExist) {
        return {
          error: true,
          data: { errorMessage: "Name already exists" },
          status: 400,
        };
      }
      updatedData.name = form.name;
    }
    if (form.password) {
      updatedData.password = await bcrypt.hash(form.password, 10);
    }

    const updatedApp = await db.app.update({
      where: { id },
      data: updatedData,
    });
    const { password, ...dataApp } = updatedApp;

    const token = await generateToken(
      { id: updatedApp.id, name: updatedApp.name, email: updatedApp.email },
      secretKey
    );
    return {
      error: false,
      status: 200,
      data: { successMessage: "App updated successfully", token, app: dataApp },
    };
  } catch (error) {
    console.error("Error updating app:", error);
    return {
      error: true,
      status: 500,
      data: { errorMessage: "Service Error" },
    };
  }
};

export const deleteApp = async (id: number): Promise<IAppDeleteResult> => {
  try {
    const app = await db.app.findUnique({ where: { id } });
    if (!app) {
      return { error: true, message: "Application not found", status: 404 };
    }

    await db.app.delete({ where: { id } });
    return {
      error: false,
      message: "Application deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error deleting app:", error);
    return { error: true, message: "Service Error", status: 500 };
  }
};
