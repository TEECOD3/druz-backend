import express, { Router } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

export const handleLogger = (router: Router): void => {
  router.use(morgan("combined"));
};

export const handleBodyRequestParsing = (router: Router): void => {
  router.use(express.json());
  router.use(express.urlencoded({ extended: false }));
};

export const handleCors = (router: Router): void => {
  router.use(cors({ credentials: true, origin: true }));
};

export const handleCompression = (router: Router): void => {
  router.use(compression());
};

export const handleHelmet = (router: Router): void => {
  router.use(helmet());
};
