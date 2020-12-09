import app from "../app";
import supertest from "supertest";
const request = supertest(app);
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const databaseName = "druz-profile-test";
import User from "../models/User";
import Answer from "../models/Answer";
import {
  createConnection,
  dropAllCollections,
  removeCollections,
} from "../utils/testingUtils";
import sampleAnswers from "../utils/sampleAnswers";
const routes = {
  register: "/api/v1/auth/register",
  login: "/api/v1/auth/login",
  editProfile: "/api/v1/profile",
  changePassword: "/api/v1/profile/password",
  deleteAccount: "/api/v1/profile",
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

const registerUser = async (name = "erons", email = "eronmmer@gmail.com") => {
  return await request.post(routes.register).send({
    name,
    email,
    password: "myPassword",
  });
};

describe("Profile: Edit profile, change password, delete account", () => {
  describe("Edit profile", () => {
    it("Should update and return user profile successfully if only name is passed", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.editProfile)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Ehis",
        });

      const user = await User.findById(registerResponse.body.data.user._id);

      expect(response.status).toBe(200);
      expect(response.body.data.msg).toBe("Profile updated successfully");
      expect(response.body.data.name).toBe("ehis");
      expect(response.body.data.email).toBe("eronmmer@gmail.com");
      expect(user.name).toBe("ehis");
      expect(user.email).toBe("eronmmer@gmail.com");
    });

    it("Should update and return profile successfully if only email is passed", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.editProfile)
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "ehis@gmail.com",
        });

      const user = await User.findById(registerResponse.body.data.user._id);

      expect(response.status).toBe(200);
      expect(response.body.data.msg).toBe("Profile updated successfully");
      expect(response.body.data.name).toBe("erons");
      expect(response.body.data.email).toBe("ehis@gmail.com");
      expect(user.name).toBe("erons");
      expect(user.email).toBe("ehis@gmail.com");
    });

    it("Should update and return profile if both email and password are passed", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.editProfile)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Ehis",
          email: "ehis@gmail.com",
        });

      const user = await User.findById(registerResponse.body.data.user._id);

      expect(response.status).toBe(200);
      expect(response.body.data.msg).toBe("Profile updated successfully");
      expect(response.body.data.name).toBe("ehis");
      expect(response.body.data.email).toBe("ehis@gmail.com");
      expect(user.name).toBe("ehis");
      expect(user.email).toBe("ehis@gmail.com");
    });

    it("Should return error if name is taken", async () => {
      const registerResponse = await registerUser();
      await registerUser("ehis", "madeux@gmail.com");
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.editProfile)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "ehis",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe(
        "Name is already taken. Please choose anther one",
      );
    });

    it("Should return error if email is taken", async () => {
      const registerResponse = await registerUser();
      await registerUser("alright", "fuckshit@gmail.com");
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.editProfile)
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "fuckshit@gmail.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe(
        "Email is already taken. Please choose anther one",
      );
    });

    it("Should return error if email is present but not valid", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.editProfile)
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "",
        });

      const user = await User.findById(registerResponse.body.data.user._id);

      expect(response.status).toBe(422);
      expect(response.body.errors[0].msg).toBe("Email is required");
      expect(user.email).toBe("eronmmer@gmail.com");
    });

    it("Should return error if name is present but not available or does not meet the validation requirements", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.editProfile)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: ".",
        });

      const user = await User.findById(registerResponse.body.data.user._id);

      expect(response.status).toBe(422);
      expect(response.body.errors[0].msg).toBe(
        "This name is not available. Please try another",
      );
      expect(user.name).toBe("erons");
    });

    it("Should return 401 if user is not logged in", async () => {
      const response = await request.patch(routes.editProfile).send({
        name: "Ehis",
        email: "ehis@gmail.com",
      });

      expect(response.status).toBe(401);
      expect(response.body.errors[0].msg).toBe("Not authorized");
    });
  });

  describe("Change password", () => {
    it("Should let users change their passwords successfully", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.changePassword)
        .set("Authorization", `Bearer ${token}`)
        .send({
          password: {
            old: "myPassword",
            new: "newPassword",
          },
        });

      const user = await User.findById(registerResponse.body.data.user._id);
      const isMatch = await bcrypt.compare("newPassword", user.password);

      expect(response.status).toBe(200);
      expect(response.body.data.msg).toBe("Password changed successfully");
      expect(isMatch).toBeTruthy();
    });

    it("Should return an error message if users pass a wrong password", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.changePassword)
        .set("Authorization", `Bearer ${token}`)
        .send({
          password: {
            old: "password",
            new: "newPassword",
          },
        });

      const user = await User.findById(registerResponse.body.data.user._id);
      const isMatch = await bcrypt.compare("password", user.password);

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Password is incorrect");
      expect(isMatch).toBeFalsy();
    });

    it("Should return an error message if users pass a new password less than 4 characters", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.changePassword)
        .set("Authorization", `Bearer ${token}`)
        .send({
          password: {
            old: "myPassword",
            new: "car",
          },
        });

      const user = await User.findById(registerResponse.body.data.user._id);
      const isMatch = await bcrypt.compare("car", user.password);

      expect(response.status).toBe(422);
      expect(response.body.errors[0].msg).toBe(
        "Password must be at least 4 characters",
      );
      expect(isMatch).toBeFalsy();
    });

    it("Should return an error message if users don't pass old or new password", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.changePassword)
        .set("Authorization", `Bearer ${token}`)
        .send({
          password: "newPassword",
        });

      expect(response.status).toBe(422);
      expect(response.body.errors[0].msg).toBe("Password field is required");
    });

    it("Should return an error message if password field is empty", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      const response = await request
        .patch(routes.changePassword)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(422);
      expect(response.body.errors[0].msg).toBe("Password field is required");
    });

    it("Should return 401 if user is not logged in", async () => {
      const response = await request.patch(routes.changePassword).send({
        password: {
          old: "myPassword",
          new: "newPassword",
        },
      });

      expect(response.status).toBe(401);
      expect(response.body.errors[0].msg).toBe("Not authorized");
    });
  });

  describe("Account deletion", () => {
    it("Should delete a user's account successfully and all their answers", async () => {
      const registerResponse = await registerUser();
      const token = registerResponse.body.data.token;

      // add an answer to the created account
      const user = await User.findOne({ name: "erons" });
      const id = user.id;

      const answers1 = new Answer({
        user: id,
        answers: sampleAnswers,
      });

      const answers2 = new Answer({
        user: id,
        name: "Indaboski",
        answers: sampleAnswers,
      });

      await answers1.save();
      await answers2.save();

      const answersBeforeDeletion = await Answer.find({ user: id });

      const response = await request
        .delete(routes.deleteAccount)
        .set("Authorization", `Bearer ${token}`);

      const answersAfterDeletion = await Answer.find({ user: id });

      expect(response.status).toBe(200);
      expect(response.body.data.msg).toBe("Account successfully deleted.");
      expect(answersBeforeDeletion.length).toBe(2);
      expect(answersAfterDeletion.length).toBe(0);
    });

    it("Should return 401 if user is not logged in", async () => {
      const response = await request.delete(routes.deleteAccount);

      expect(response.status).toBe(401);
      expect(response.body.errors[0].msg).toBe("Not authorized");
    });
  });
});
