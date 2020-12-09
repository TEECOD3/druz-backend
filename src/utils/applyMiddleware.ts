import { Router } from "express";
const applyMiddleware = (
  middleware: { (router: Router): void }[],
  router: Router,
): void => {
  middleware.forEach((individualMiddleware) => {
    individualMiddleware(router);
  });
};

export default applyMiddleware;
