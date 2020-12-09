import app from "../app";
import supertest from "supertest";
const request = supertest(app);
import mongoose from "mongoose";
const databaseName = "druz-answer-test";
import {
  createConnection,
  dropAllCollections,
  removeCollections,
} from "../utils/testingUtils";
import sampleAnswers from "../utils/sampleAnswers";
import Answer from "../models/Answer";
const routes = {
  register: "/api/v1/auth/register",
  submitAnswers: "/api/v1/answer",
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

describe("Submit answers to users' questions", () => {
  it("Should return 200 status when users correctly submit answers", async () => {
    const registerResponse = await registerUser();
    const id = registerResponse.body.data.user._id;

    const response = await request.post(`${routes.submitAnswers}/${id}`).send({
      user: id,
      answers: sampleAnswers,
    });

    expect(response.status).toBe(200);
  });

  it("Should return success a message when users correctly submit answers", async () => {
    const registerResponse = await registerUser();
    const id = registerResponse.body.data.user._id;

    const response = await request.post(`${routes.submitAnswers}/${id}`).send({
      user: id,
      answers: sampleAnswers,
    });
    expect(response.body.data.msg).toBe("Answers submitted successfully");
  });

  it("Should return answers when users correctly submit answers", async () => {
    const registerResponse = await registerUser();
    const id = registerResponse.body.data.user._id;

    const response = await request.post(`${routes.submitAnswers}/${id}`).send({
      user: id,
      answers: sampleAnswers,
    });
    expect(response.body.data.answers.sort()).toEqual(sampleAnswers.sort());
  });

  it("Should save answers to DB", async () => {
    const registerResponse = await registerUser();
    const id = registerResponse.body.data.user._id;

    await request.post(`${routes.submitAnswers}/${id}`).send({
      user: id,
      answers: sampleAnswers,
    });
    const answer = await Answer.findOne({ user: id });
    expect(answer).toBeTruthy();
  });

  it("Should return 404 error if user id is not found", async () => {
    await registerUser();

    const response = await request
      .post(`${routes.submitAnswers}/random-id`)
      .send({
        user: "random-id",
        answers: sampleAnswers,
      });

    expect(response.status).toBe(404);
  });

  it("Should return error message if user id is not found", async () => {
    await registerUser();

    const response = await request
      .post(`${routes.submitAnswers}/random-id`)
      .send({
        user: "random-id",
        answers: sampleAnswers,
      });

    expect(response.body.errors[0].msg).toBe("User not found");
  });

  it("Should return 422 error if answers is empty", async () => {
    const registerResponse = await registerUser();
    const id = registerResponse.body.data.user._id;

    const response = await request.post(`${routes.submitAnswers}/${id}`).send({
      user: id,
    });

    expect(response.status).toBe(422);
  });

  it("Should return error message if answers is empty", async () => {
    const registerResponse = await registerUser();
    const id = registerResponse.body.data.user._id;

    const response = await request.post(`${routes.submitAnswers}/${id}`).send({
      user: id,
    });

    expect(response.body.errors[0].msg).toBe("Please add answers");
  });
});
