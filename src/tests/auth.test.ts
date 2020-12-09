import app from "../app";
import supertest from "supertest";
const request = supertest(app);
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const databaseName = "druz-auth-test";
import {
  createConnection,
  dropAllCollections,
  removeCollections,
} from "../utils/testingUtils";
import User from "../models/User";
const routes = {
  register: "/api/v1/auth/register",
  login: "/api/v1/auth/login",
  getUser: "/api/v1/auth/user",
  forgotPassword: "/api/v1/auth/forgot-password",
  passwordReset: "/api/v1/auth/reset-password",
};

beforeAll(async () => {
  await createConnection(databaseName);
});

beforeEach(async () => {
  await removeCollections();
});

afterAll(async () => {
  await dropAllCollections();
  await mongoose.connection.close();
});

const registerUser = async () => {
  return await request.post(routes.register).send({
    name: "erons",
    email: "eronmmer@gmail.com",
    password: "myPassword",
  });
};

describe("Auth test: Signup, login, forgot password and password reset", () => {
  describe("For register", () => {
    it("Should return 200 status on successful registration", async () => {
      const response = await registerUser();

      expect(response.status).toBe(200);
    });

    it("Should return token on successful registration", async () => {
      const response = await registerUser();

      expect(response.body.data.token).toBeTruthy();
    });

    it("Should return correct info about user on successful registration", async () => {
      const response = await registerUser();

      expect(response.body.data.user).toHaveProperty("name", "erons");
    });

    it("Should save user to DB", async () => {
      await registerUser();

      const user = await User.findOne({ name: "erons" });
      expect(user).toBeTruthy();
    });

    it("Should return 422 status when users register with unsupported characters", async () => {
      const response = await request.post(routes.register).send({
        name: "erons.me",
        password: "password",
      });

      expect(response.status).toBe(422);
    });

    it("Should return error message when users register with unsupported characters", async () => {
      const response1 = await request.post(routes.register).send({
        name: "erons.me",
        password: "password",
      });

      const response2 = await request.post(routes.register).send({
        name: "LOGIN",
        password: "password",
      });

      expect(response1.body.errors[0].msg).toBe(
        "This name is unavailable. Please choose another one",
      );
      expect(response2.body.errors[0].msg).toBe(
        "This name is unavailable. Please choose another one",
      );
    });

    it("Should not save users to DB when they register with unsupported characters", async () => {
      await request.post(routes.register).send({
        name: "erons.me",
        password: "password",
      });

      const user = await User.findOne({ name: "erons" });
      expect(user).toBeFalsy();
    });

    it("Should return 400 status when users register with an existing name", async () => {
      await registerUser();

      const response = await request.post(routes.register).send({
        name: "erons",
        password: "password",
      });

      expect(response.status).toBe(400);
    });

    it("Should return error message when users register with an existing name", async () => {
      await registerUser();

      const response = await request.post(routes.register).send({
        name: "erons",
        password: "password",
      });

      expect(response.body.errors[0].msg).toBe(
        "Name is already taken. Pick another one",
      );
    });

    it("Should return 400 status when users register with an existing email", async () => {
      await registerUser();

      const response = await request.post(routes.register).send({
        name: "anotherPerson",
        email: "eronmmer@gmail.com",
        password: "password",
      });

      expect(response.status).toBe(400);
    });

    it("Should return error message when users register with an existing email", async () => {
      await registerUser();

      const response = await request.post(routes.register).send({
        name: "anotherPerson",
        email: "eronmmer@gmail.com",
        password: "password",
      });

      expect(response.body.errors[0].msg).toBe(
        "Email is already taken. Pick another one",
      );
    });

    it("Should not save user when they try to register with an already existing name", async () => {
      await registerUser();

      await request.post(routes.register).send({
        name: "erons",
        password: "password",
      });

      const user = await User.findOne({ name: "erons" });
      const isMatch = await bcrypt.compare("password", user!.password);

      expect(isMatch).toBeFalsy();
    });

    it("Should not save user when they try to register with an already existing email", async () => {
      await registerUser();

      await request.post(routes.register).send({
        name: "anotherPerson",
        email: "eronmmer@gmail.com",
        password: "password",
      });

      const user = await User.findOne({ email: "eronmmer@gmail.com" });
      const isMatch = await bcrypt.compare("password", user!.password);

      expect(isMatch).toBeFalsy();
    });

    it("Should not let users register if their password is less than 4 characters", async () => {
      const response = await request.post(routes.register).send({
        name: "anotherPerson",
        password: "pas",
      });

      const user = await User.findOne({ name: "anotherperson" });

      expect(response.status).toBe(422);
      expect(response.body.errors[0].msg).toBe(
        "Password must be at least 4 characters",
      );
      expect(user).toBeFalsy();
    });

    it("Should return 422 status if user's password is less than 4 characters", async () => {
      const response = await request.post(routes.register).send({
        name: "anotherPerson",
        password: "pas",
      });

      expect(response.status).toBe(422);
    });

    it("Should not return error message if user's password is less than 4 characters", async () => {
      const response = await request.post(routes.register).send({
        name: "anotherPerson",
        password: "pas",
      });

      expect(response.body.errors[0].msg).toBe(
        "Password must be at least 4 characters",
      );
    });

    it("Should not save user to DB if their password is less than 4 characters", async () => {
      await request.post(routes.register).send({
        name: "anotherPerson",
        password: "pas",
      });

      const user = await User.findOne({ name: "anotherperson" });

      expect(user).toBeFalsy();
    });
  });

  describe("For Login", () => {
    it("Should return 200 status when a user logs in", async () => {
      await registerUser();

      const response = await request.post(routes.login).send({
        name: "erons",
        password: "myPassword",
      });

      expect(response.status).toBe(200);
    });

    it("Should return token when a user logs in", async () => {
      await registerUser();

      const response = await request.post(routes.login).send({
        name: "erons",
        password: "myPassword",
      });

      expect(response.body.data.token).toBeTruthy();
    });

    it("Should return user info when they log in", async () => {
      await registerUser();

      const response = await request.post(routes.login).send({
        name: "erons",
        password: "myPassword",
      });

      expect(response.body.data.user).toBeTruthy();
    });

    it("Should prevent users from logging in with incorrect name", async () => {
      await registerUser();

      const response = await request.post(routes.login).send({
        name: "eronse",
        password: "myPassword",
      });

      expect(response.status).toBe(400);
    });

    it("Should prevent users from logging in with incorrect password", async () => {
      await registerUser();

      const response2 = await request.post(routes.login).send({
        name: "erons",
        password: "somethingElse",
      });

      expect(response2.status).toBe(400);
    });
  });

  describe("For getting user info after logging in", () => {
    it("Should return 200 status after logging in", async () => {
      await registerUser();
      const login = await request.post(routes.login).send({
        name: "erons",
        password: "myPassword",
      });

      const token = login.body.data.token;

      const response = await request
        .get(routes.getUser)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
    });

    it("Should return user info after logging in", async () => {
      await registerUser();
      const login = await request.post(routes.login).send({
        name: "erons",
        password: "myPassword",
      });

      const token = login.body.data.token;

      const response = await request
        .get(routes.getUser)
        .set("Authorization", `Bearer ${token}`);
      expect(response.body.data.user).toBeTruthy();
    });

    it("Should not show any user info if token is invalid", async () => {
      const response = await request
        .get(routes.getUser)
        .set("Authorization", "");

      expect(response.status).toBe(401);
    });

    it("Should return 401 if user is not logged in", async () => {
      const response = await request.get(routes.getUser);

      expect(response.status).toBe(401);
    });
  });

  describe("Forgot password", () => {
    it("Should send reset link to user with valid email", async () => {
      await registerUser();
      const response = await request.post(routes.forgotPassword).send({
        name: "erons",
      });

      const user = await User.findOne({ name: "erons" });

      expect(response.body.data.msg).toBe(
        "Reset link sent successfully to your email.",
      );
      expect(user!.resetToken).toBeTruthy();
      expect(user!.resetTokenExpirationDate).toBeTruthy();
    });

    it("Should save token to DB after password reset request", async () => {
      await registerUser();
      await request.post(routes.forgotPassword).send({
        name: "erons",
      });

      const user = await User.findOne({ name: "erons" });

      expect(user!.resetToken).toBeTruthy();
    });

    it("Should save token expiration to DB after password reset request", async () => {
      await registerUser();
      await request.post(routes.forgotPassword).send({
        name: "erons",
      });

      const user = await User.findOne({ name: "erons" });

      expect(user!.resetTokenExpirationDate).toBeTruthy();
    });

    // it("Should prevent email action if user is not found", async () => {
    // 	const response = await request.post(routes.forgotPassword).send({
    // 		name: "erons",
    // 	});

    // 	expect(response.status).toBe(400);
    // 	expect(response.body.errors[0].msg).toBe(
    // 		"No account is associated with this name."
    // 	);
    // });

    // it("Should prevent email action if a user doesn't have their email setup", async () => {
    // 	await request.post(routes.register).send({
    // 		name: "erons",
    // 		password: "myPassword",
    // 	});
    // 	const response = await request.post(routes.forgotPassword).send({
    // 		name: "erons",
    // 	});

    // 	const user = await User.findOne({ name: "erons" });

    // 	expect(response.status).toBe(400);
    // 	expect(response.body.errors[0].msg).toBe(
    // 		"No email is associated with this account."
    // 	);
    // 	expect(user.resetToken).toBeFalsy();
    // 	expect(user.resetTokenExpirationDate).toBeFalsy();
    // });
  });
});
