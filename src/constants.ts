import { z } from "zod";
import { ESortDirection } from "./enums";

export const COMMON_VALIDATE_PAGE_SEARCH_PARAMS = z.object({
  size: z.number().optional(),
  offset: z.number().optional(),
  sort: z.string().optional(),
  sortDirection: z.nativeEnum(ESortDirection).optional(),
  q: z.string().optional(),
});

export type TPageSearchParams = z.infer<
  typeof COMMON_VALIDATE_PAGE_SEARCH_PARAMS
>;
