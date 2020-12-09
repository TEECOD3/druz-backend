import app from "../app";
import supertest from "supertest";
const request = supertest(app);
import mongoose from "mongoose";
const databaseName = "druz-question-test";
import User from "../models/User";
import {
  createConnection,
  dropAllCollections,
  removeCollections,
} from "../utils/testingUtils";
const routes = {
  register: "/api/v1/auth/register",
  addQuestion: "/api/v1/question",
  removeQuestion: "/api/v1/question",
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

describe("Question: Add a question, remove a question", () => {
  describe("Add a question", () => {
    it("Should successfully add a question to a user's profile", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.addQuestion)
        .set("Authorization", `Bearer ${token}`)
        .send({
          question: "Will you marry me?",
        });

      const user = await User.findOne({ name: "erons" });

      expect(response.status).toBe(200);
      expect(response.body.data.msg).toBe("Question added successfully");
      expect(user.questions.length).toBe(10);
      expect(user.questions[9].content).toBe("Will you marry me?");
    });

    it("Should return 422 when question is not passed", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.addQuestion)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.errors[0].msg).toBe("Please add a question");
    });

    it("Should return 401 if user isn't logged in or authenticated", async () => {
      await registerUser();

      const response = await request.patch(routes.addQuestion).send({
        question: "Would you die for me?",
      });

      expect(response.status).toBe(401);
      expect(response.body.errors[0].msg).toBe("Not authorized");
    });
  });

  describe("Remove question", () => {
    it("Should successfully remove a question from a user's profile", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const id = registerResponse.body.data.user.questions[0]._id;

      const response = await request
        .delete(`${routes.removeQuestion}/${id}`)
        .set("Authorization", `Bearer ${token}`);

      const user = await User.findOne({ name: "erons" });

      expect(response.status).toBe(200);
      expect(response.body.data.msg).toBe("Question removed successfully");
      expect(user.questions.length).toBe(8);
    });

    it("Should return 404 if question is not found", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .delete(`${routes.removeQuestion}/random-ass-id`)
        .set("Authorization", `Bearer ${token}`);

      const user = await User.findOne({ name: "erons" });

      expect(response.status).toBe(404);
      expect(response.body.errors[0].msg).toBe("Question not found");
      expect(user.questions.length).toBe(9);
    });

    it("Should return 401 if user isn't logged in or authenticated", async () => {
      const registerResponse = await registerUser();

      const id = registerResponse.body.data.user.questions[0]._id;

      const response = await request.delete(`${routes.removeQuestion}/${id}`);

      const user = await User.findOne({ name: "erons" });

      expect(response.status).toBe(401);
      expect(response.body.errors[0].msg).toBe("Not authorized");
      expect(user.questions.length).toBe(9);
    });
  });
});
