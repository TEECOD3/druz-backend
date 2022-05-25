import express from "express";
const router = express.Router();
import verifyAdmin from "../middleware/verifyAdmin";
import authenticate from "../middleware/authenticate";
import {
  getAllUsers,
  removeUser,
  dashboardPass,
  getBasicData,
  searchUser,
  clearOldAnswers,
  removeInactiveUsers,
} from "../controllers/admin";
import { check } from "express-validator";

/*
 * @desc Simple Dashboard pass
 * @method POST
 * @api Fucking private(Only me can see this shit)
 */
router.post(
  "/dashboard-pass",
  [
    authenticate,
    verifyAdmin,
    check("name", "Not found").notEmpty(),
    check("password", "Not found").notEmpty(),
  ],
  dashboardPass,
);

/*
 * @desc Get basic data
 * @method GET
 * @api Fucking private(Only me can see this shit)
 */
router.get("/basic-data", [authenticate, verifyAdmin], getBasicData);

/*
 * @desc Search and get single user
 * @method GET
 * @api Fucking private(Only me can see this shit)
 */
router.get("/search-user/:name", [authenticate, verifyAdmin], searchUser);

/*
 * @desc clear old answers
 * @method PATCH
 * @api Fucking private(Only me can see this shit)
 */
router.patch(
  "/clear-old-answers",
  [authenticate, verifyAdmin],
  clearOldAnswers,
);

/*
 * @desc remove inactive users
 * @method DELETE
 * @api Fucking private(Only me can see this shit)
 */
router.delete(
  "/remove-inactive-users",
  [authenticate, verifyAdmin],
  removeInactiveUsers,
);

/*
 * @desc Get all users info
 * @method GET
 * @api Fucking private(Only me can see this shit)
 */
router.get("/all-users", [authenticate, verifyAdmin], getAllUsers);

/*
 * @desc Remove a user
 * @method DELETE
 * @api Fucking private(Only me can see this shit)
 */
router.delete("/remove-user/:userId", [authenticate, verifyAdmin], removeUser);

export default router;
