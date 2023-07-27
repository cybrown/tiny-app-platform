import { defineFunction, RuntimeContext } from "tal-eval";
import { load } from "cheerio";
import { CheerioAPI } from "cheerio";

export const cheerio_load = defineFunction(
  "cheerio_load",
  [{ name: "source" }],
  cheerio_load_impl
);

export const cheerio_find = defineFunction(
  "cheerio_find",
  [{ name: "doc" }, { name: "selector" }],
  cheerio_find_impl
);

function cheerio_load_impl(
  _ctx: RuntimeContext,
  { source }: { [key: string]: any }
) {
  return load(source);
}

function cheerio_find_impl(
  _ctx: RuntimeContext,
  { selector, doc }: { [key: string]: any }
) {
  return (doc as CheerioAPI)(selector)
    .toArray()
    .map((node: any) => ({
      tag: node.tagName,
      attributes: Object.fromEntries(
        (node.attributes as any[]).map(({ name, value }) => [name, value])
      ),
      content: doc.html(node.children),
    }));
}
