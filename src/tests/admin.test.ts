import app from "../app";
import supertest from "supertest";
const request = supertest(app);
import mongoose from "mongoose";
const databaseName = "druz-admin-test";
import {
  createConnection,
  dropAllCollections,
  removeCollections,
} from "../utils/testingUtils";
import Answer from "../models/Answer";
const routes = {
  register: "/api/v1/auth/register",
  getAllUsers: "/api/v1/admin/all-users",
  getData: "/api/v1/admin/get-data",
  removeUser: "/api/v1/admin/remove-user",
  dashboardPass: "/api/v1/admin/dashboard-pass",
  getBasicData: "/api/v1/admin/basic-data",
  searchUser: "/api/v1/admin/search-user",
  clearOldAnswers: "/api/v1/admin/clear-old-answers",
  removeInactiveUsers: "/api/v1/admin/remove-inactive-users",
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

const registerAdmin = async () => {
  return await request.post(routes.register).send({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
  });
};

describe("All the shit the admin wants to do", () => {
  it("Should return all user data when admin is logged in", async () => {
    await registerUser();
    const adminResponse = await registerAdmin();
    const token = adminResponse.body.data.token;

    const response = await request
      .get(routes.getAllUsers)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.msg).toBe("successfully fetched shit");
  });

  it("Should return 401 when admin isn't logged in", async () => {
    await registerUser();
    await registerAdmin();

    const response = await request.get(routes.getAllUsers);
    expect(response.status).toBe(401);
  });

  it("Should return 403 when logged in user isn't an admin", async () => {
    const registerResponse = await registerUser();
    const token = registerResponse.body.data.token;

    const response = await request
      .get(routes.getAllUsers)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(403);
    expect(response.body.errors[0].msg).toBe(
      "Not allowed!!! Get the fuck out of here asshole",
    );
  });

  it("Should remove a user", async () => {
    const registerResponse = await registerUser();
    const adminResponse = await registerAdmin();
    const token = adminResponse.body.data.token;

    const id = registerResponse.body.data.user._id;

    const response = await request
      .delete(`${routes.removeUser}/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.msg).toBe("User successfully removed");
  });

  it("Should take care of dashboard pass", async () => {
    const adminResponse = await registerAdmin();
    const token = adminResponse.body.data.token;

    const response = await request
      .post(routes.dashboardPass)
      .send({
        name: process.env.ADMIN_NAME,
        password: process.env.ADMIN_PASSWORD,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.msg).toBe("hell yeah.");
  });

  it("Should send 404 if admin tries to access dashboard with incorrect credentials", async () => {
    const adminResponse = await registerAdmin();
    const token = adminResponse.body.data.token;

    const response = await request
      .post(routes.dashboardPass)
      .send({
        name: process.env.ADMIN_NAME,
        password: "fuckshit",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.errors[0].msg).toBe("Not found");
  });

  it("Should not let access if just any user tries to access dashboard", async () => {
    const userResponse = await registerUser();
    const token = userResponse.body.data.token;

    const response = await request
      .post(routes.dashboardPass)
      .send({
        name: process.env.ADMIN_NAME,
        password: process.env.ADMIN_PASSWORD,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.errors[0].msg).toBe(
      "Not allowed!!! Get the fuck out of here asshole",
    );
  });

  it("should getBasicData successfully", async () => {
    const adminResponse = await registerAdmin();
    const token = adminResponse.body.data.token;

    const response = await request
      .get(routes.getBasicData)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.totalUsers).toBe(1);
    expect(response.body.data.totalAnswers).toBe(0);
  });

  it("shouldn't getBasicData is user isn't an admin", async () => {
    const userResponse = await registerUser();
    const token = userResponse.body.data.token;

    const response = await request
      .get(routes.getBasicData)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("should searchUser successfully", async () => {
    const adminResponse = await registerAdmin();
    await registerUser();
    const token = adminResponse.body.data.token;

    const response = await request
      .get(`${routes.searchUser}/erons`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.name).toBe("erons");
    expect(response.body.data.user.email).toBe("eronmmer@gmail.com");
  });

  it("should return 404 if user isn't found", async () => {
    const adminResponse = await registerAdmin();
    const token = adminResponse.body.data.token;

    const response = await request
      .get(`${routes.searchUser}/mado`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.errors[0].msg).toBe("User not found");
  });

  it("Should return 404 status and error message if a user can't be found", async () => {
    const registerResponse = await registerUser();
    const adminResponse = await registerAdmin();
    const token = adminResponse.body.data.token;

    const id = registerResponse.body.data.user._id;
    const answers = await Answer.find({ user: id });

    const response = await request
      .delete(`${routes.removeUser}/something`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(answers.length).toBe(0);
  });

  it("Should return 401 when user is isn't logged in", async () => {
    const registerResponse = await registerUser();
    await registerAdmin();

    const id = registerResponse.body.data.user._id;

    const response = await request.delete(`${routes.removeUser}/${id}`);
    expect(response.status).toBe(401);
  });

  it("Should return 403 when logged in user isn't ad admin", async () => {
    const registerResponse = await registerUser();
    const token = registerResponse.body.data.token;

    const id = registerResponse.body.data.user._id;

    const response = await request
      .delete(`${routes.removeUser}/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(403);
    expect(response.body.errors[0].msg).toBe(
      "Not allowed!!! Get the fuck out of here asshole",
    );
  });
});
