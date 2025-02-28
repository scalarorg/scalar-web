import { routeTree } from "@/routeTree.gen";
import {
  ParseRoute,
  RegisteredRouter,
  RouteIds,
  RoutePaths,
} from "@tanstack/react-router";

export type ValidRoutes = ParseRoute<typeof routeTree>["fullPath"];
export type RoutePath = RoutePaths<RegisteredRouter["routeTree"]>;
export type RouteId = RouteIds<RegisteredRouter["routeTree"]>;
