import { v4 as uuidv4 } from "uuid";
import { defineFunction } from "tal-eval";

export const uuid_v4 = defineFunction("uuid_v4", [], (ctx, args) => uuidv4());
