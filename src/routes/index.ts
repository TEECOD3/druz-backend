import auth from "./auth";
import question from "./question";
import answer from "./answer";
import user from "./user";
import profile from "./profile";
import admin from "./admin";

const allRoutes = [
  { endpoint: "/api/v1/auth", route: auth },
  { endpoint: "/api/v1/question", route: question },
  { endpoint: "/api/v1/answer", route: answer },
  { endpoint: "/api/v1/user", route: user },
  { endpoint: "/api/v1/profile", route: profile },
  { endpoint: "/api/v1/admin", route: admin },
];

export default allRoutes;
