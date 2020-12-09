import app from "../app";
import supertest from "supertest";
const request = supertest(app);
import mongoose from "mongoose";
const databaseName = "druz-user-test";
import {
  createConnection,
  dropAllCollections,
  removeCollections,
} from "../utils/testingUtils";
const routes = {
  register: "/api/v1/auth/register",
  getUserProfile: "/api/v1/user",
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

describe("User route: Get profile by id or name", () => {
  it("Should return a user when name is passed", async () => {
    await registerUser();

    const response = await request.get(`${routes.getUserProfile}?name=erons`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.name).toBe("erons");
    expect(response.body.data.user).toHaveProperty("questions");
    expect(response.body.data.user).toHaveProperty("_id");
  });

  it("Should return a user when id is passed", async () => {
    const registerResponse = await registerUser();
    const id = registerResponse.body.data.user._id;

    const response = await request.get(`${routes.getUserProfile}?id=${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.name).toBe("erons");
    expect(response.body.data.user).toHaveProperty("questions");
    expect(response.body.data.user).toHaveProperty("_id");
  });

  it("Should return 404 when unknown user is passed", async () => {
    const response = await request.get(`${routes.getUserProfile}?name=erons`);

    expect(response.status).toBe(404);
    expect(response.body.errors[0].msg).toBe("User not found");
  });

  it("Should return 404 when unknown id is passed", async () => {
    const response = await request.get(
      `${routes.getUserProfile}?id=some-random-id`,
    );

    expect(response.status).toBe(404);
    expect(response.body.errors[0].msg).toBe("User not found");
  });

  it("Should return 404 when nothing is passed", async () => {
    const response = await request.get(`${routes.getUserProfile}`);

    expect(response.status).toBe(404);
    expect(response.body.errors[0].msg).toBe("User not found");
  });
});
