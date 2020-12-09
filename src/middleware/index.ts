import {
  handleLogger,
  handleBodyRequestParsing,
  handleCompression,
  handleCors,
  handleHelmet,
} from "./common";

const allMiddleware = [
  handleBodyRequestParsing,
  handleCompression,
  handleCors,
  handleHelmet,
  handleLogger,
];

export default allMiddleware;
