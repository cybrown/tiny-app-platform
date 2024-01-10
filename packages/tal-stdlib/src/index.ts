import { RuntimeContext } from 'tal-eval';
import {
  array_append,
  array_concat,
  array_filter,
  array_flat_map,
  array_get,
  array_group,
  array_join,
  array_length,
  array_map,
  array_map_parallel,
  array_range,
  array_unique,
  array_reduce,
  array_remove,
  array_reverse,
  array_skip,
  array_sort,
  array_take,
  array_to_object,
} from './functions/array';
import { bytes_to_string } from './functions/bytes';
import { cheerio_find, cheerio_load } from './functions/cheerio';
import {
  default$,
  log,
  throw$,
  typeof$,
  watch,
  eval_js,
  is_defined,
  set_system_property,
  copy,
  on_create,
} from './functions/core';
import { http_request_form, http_request } from './functions/http';
import { jmespath_search, json_parse, json_stringify } from './functions/json';
import {
  mongodb_delete_one,
  mongodb_find,
  mongodb_insert_one,
  mongodb_update_one,
} from './functions/mongodb';
import {
  number_to_string,
  number_ceil,
  number_floor,
  number_round,
  number_abs,
  number_sign,
  number_trunc,
  number_random,
  number_randint,
} from './functions/number';
import {
  object_entries,
  object_get,
  object_keys,
  object_merge,
  object_set,
  object_values,
} from './functions/object';
import { pg_query } from './functions/pg';
import { process_exec } from './functions/process';
import { regex_match } from './functions/regex';
import {
  storage_list,
  storage_read,
  storage_remove,
  storage_write,
} from './functions/storage';
import {
  string_contains,
  string_ends_with,
  string_format,
  string_locale_compare,
  string_lower,
  string_split,
  string_starts_with,
  string_upper,
  string_slice,
  string_repeat,
  string_trim_start,
  string_trim_end,
  string_pad_start,
  string_pad_end,
  string_to_bytes,
  string_to_number,
  string_trim,
} from './functions/string';
import { time_parse, time_day_of_week } from './functions/time';
import { uuid_v4 } from './functions/uuid';
import {
  date_current_timezone,
  date_day_of_month,
  date_day_of_week,
  date_from_iso_string,
  date_hours,
  date_milli_seconds,
  date_minutes,
  date_month,
  date_now,
  date_seconds,
  date_to_iso_string_utc,
  date_to_timezone,
  date_year,
} from './functions/date';
import { metadata_set, metadata_get } from './functions/metadata';
import { flex, scroller } from './functions/widget';

export function importStdlibInContext(ctx: RuntimeContext) {
  ctx.registerFunction(default$);
  ctx.registerFunction(log);
  ctx.registerFunction(copy);
  ctx.registerFunction(throw$);
  ctx.registerFunction(typeof$);
  ctx.registerFunction(on_create);
  ctx.registerFunction(watch);

  ctx.registerFunction(array_append);
  ctx.registerFunction(array_concat);
  ctx.registerFunction(array_filter);
  ctx.registerFunction(array_flat_map);
  ctx.registerFunction(array_get);
  ctx.registerFunction(array_group);
  ctx.registerFunction(array_join);
  ctx.registerFunction(array_length);
  ctx.registerFunction(array_map);
  ctx.registerFunction(array_map_parallel);
  ctx.registerFunction(array_range);
  ctx.registerFunction(array_unique);
  ctx.registerFunction(array_reduce);
  ctx.registerFunction(array_remove);
  ctx.registerFunction(array_reverse);
  ctx.registerFunction(array_skip);
  ctx.registerFunction(array_sort);
  ctx.registerFunction(array_take);
  ctx.registerFunction(array_to_object);
  ctx.registerFunction(bytes_to_string);
  ctx.registerFunction(cheerio_find);
  ctx.registerFunction(cheerio_load);

  ctx.registerFunction(date_from_iso_string);
  ctx.registerFunction(date_year);
  ctx.registerFunction(date_month);
  ctx.registerFunction(date_day_of_month);
  ctx.registerFunction(date_day_of_week);
  ctx.registerFunction(date_hours);
  ctx.registerFunction(date_minutes);
  ctx.registerFunction(date_seconds);
  ctx.registerFunction(date_milli_seconds);
  ctx.registerFunction(date_to_timezone);
  ctx.registerFunction(date_now);
  ctx.registerFunction(date_current_timezone);
  ctx.registerFunction(date_to_iso_string_utc);

  ctx.registerFunction(eval_js);
  ctx.registerFunction(http_request_form);
  ctx.registerFunction(http_request);
  ctx.registerFunction(is_defined);
  ctx.registerFunction(jmespath_search);
  ctx.registerFunction(json_parse);
  ctx.registerFunction(json_stringify);
  ctx.registerFunction(mongodb_delete_one);
  ctx.registerFunction(mongodb_find);
  ctx.registerFunction(mongodb_insert_one);
  ctx.registerFunction(mongodb_update_one);
  ctx.registerFunction(number_to_string);
  ctx.registerFunction(number_ceil);
  ctx.registerFunction(number_floor);
  ctx.registerFunction(number_round);
  ctx.registerFunction(number_abs);
  ctx.registerFunction(number_sign);
  ctx.registerFunction(number_trunc);
  ctx.registerFunction(number_random);
  ctx.registerFunction(number_randint);
  ctx.registerFunction(object_entries);
  ctx.registerFunction(object_get);
  ctx.registerFunction(object_keys);
  ctx.registerFunction(object_merge);
  ctx.registerFunction(object_set);
  ctx.registerFunction(object_values);
  ctx.registerFunction(pg_query);
  ctx.registerFunction(process_exec);
  ctx.registerFunction(regex_match);
  ctx.registerFunction(set_system_property);
  ctx.registerFunction(storage_list);
  ctx.registerFunction(storage_read);
  ctx.registerFunction(storage_remove);
  ctx.registerFunction(storage_write);
  ctx.registerFunction(string_contains);
  ctx.registerFunction(string_ends_with);
  ctx.registerFunction(string_format);
  ctx.registerFunction(string_locale_compare);
  ctx.registerFunction(string_lower);
  ctx.registerFunction(string_split);
  ctx.registerFunction(string_starts_with);
  ctx.registerFunction(string_upper);
  ctx.registerFunction(string_slice);
  ctx.registerFunction(string_repeat);
  ctx.registerFunction(string_trim_start);
  ctx.registerFunction(string_trim_end);
  ctx.registerFunction(string_pad_start);
  ctx.registerFunction(string_pad_end);
  ctx.registerFunction(string_to_bytes);
  ctx.registerFunction(string_to_number);
  ctx.registerFunction(string_trim);
  ctx.registerFunction(time_parse);
  ctx.registerFunction(time_day_of_week);
  ctx.registerFunction(uuid_v4);

  ctx.registerFunction(metadata_set);
  ctx.registerFunction(metadata_get);
  ctx.registerFunction(flex);
  ctx.registerFunction(scroller);
}
