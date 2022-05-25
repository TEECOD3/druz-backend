import { Router } from "express";
const applyRoutes = (
  routes: { endpoint: string; route: Router }[],
  router: Router,
): void => {
  routes.forEach((individualRoute) => {
    router.use(individualRoute.endpoint, individualRoute.route);
  });
};

export default applyRoutes;
