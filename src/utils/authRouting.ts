import { PopUser } from "@/domain/schemas";

export type AuthenticatedRoute = "/setup/geography" | "/setup/interests" | "/home";

export function postAuthRouteForUser(user: PopUser): AuthenticatedRoute {
  if (!user.userChoiceGeo.length) return "/setup/geography";
  if (!user.userInterest.length) return "/setup/interests";
  return "/home";
}

export function isAdminUser(user: PopUser) {
  return user.role.toUpperCase() === "ADMIN";
}
