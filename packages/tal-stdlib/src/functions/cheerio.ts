import { defineFunction, RuntimeContext } from 'tal-eval';
import { load } from 'cheerio';
import { CheerioAPI } from 'cheerio';

export const cheerio_load = defineFunction(
  'cheerio_load',
  [{ name: 'source' }],
  // TODO: Type when opaque types are supported
  cheerio_load_impl,
  undefined,
  {
    description: 'Loads HTML source into a Cheerio document',
    parameters: { source: 'HTML string to load' },
    returns: 'A CheerioAPI document',
  }
);

export const cheerio_find = defineFunction(
  'cheerio_find',
  [{ name: 'doc' }, { name: 'selector' }],
  // TODO: Type when opaque types are supported
  cheerio_find_impl,
  undefined,
  {
    description: 'Finds elements matching a selector in a Cheerio document',
    parameters: {
      doc: 'Cheerio document to search',
      selector: 'CSS selector string',
    },
    returns: 'Array of matched elements with tag, attributes, and content',
  }
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
