import { defineFunction } from "tal-eval";

export const event_trigger = defineFunction(
  "event_trigger",
  [{ name: "name" }],
  (ctx, { name }) => {
    ctx.trigger(name);
  }
);

export const event_on = defineFunction(
  "event_on",
  [{ name: "name" }, { name: "handler", lazy: true }],
  (ctx, { name, handler }) => {
    ctx.on(name, handler);
  },
  (ctx, { name, handler }) => {
    ctx.on(name, handler);
  }
);
