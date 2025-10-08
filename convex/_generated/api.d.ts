/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as businessIdeas from "../businessIdeas.js";
import type * as favorites from "../favorites.js";
import type * as investmentOffers from "../investmentOffers.js";
import type * as matches from "../matches.js";
import type * as messages from "../messages.js";
import type * as sampleData from "../sampleData.js";
import type * as seedData from "../seedData.js";
import type * as seedDatabase from "../seedDatabase.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  businessIdeas: typeof businessIdeas;
  favorites: typeof favorites;
  investmentOffers: typeof investmentOffers;
  matches: typeof matches;
  messages: typeof messages;
  sampleData: typeof sampleData;
  seedData: typeof seedData;
  seedDatabase: typeof seedDatabase;
  transactions: typeof transactions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
