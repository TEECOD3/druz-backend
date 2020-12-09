import express, { Router } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

const handleLogger = (router: Router): void => {
  router.use(morgan("combined"));
};

const handleBodyRequestParsing = (router: Router): void => {
  router.use(express.json());
  router.use(express.urlencoded({ extended: false }));
};

const handleCors = (router: Router): void => {
  router.use(cors({ credentials: true, origin: true }));
};

const handleCompression = (router: Router): void => {
  router.use(compression());
};

const handleHelmet = (router: Router): void => {
  router.use(helmet());
};

const commonMiddleware = {
  handleLogger,
  handleBodyRequestParsing,
  handleCompression,
  handleCors,
  handleHelmet,
};

export default commonMiddleware;
