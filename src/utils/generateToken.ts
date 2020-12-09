// generate token function
import crypto from "crypto";
const generateToken = (): string => {
  return crypto.randomBytes(30).toString("hex").slice(0, 30);
};

export default generateToken;
