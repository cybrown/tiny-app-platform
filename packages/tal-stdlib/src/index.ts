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
  array_find,
  array_find_index,
  array_set,
  array_contains,
  array_group_unique,
} from './functions/array';
import { bytes_from, bytes_to_string } from './functions/bytes';
import { cheerio_find, cheerio_load } from './functions/cheerio';
import {
  default$,
  log,
  throw$,
  typeof$,
  watch,
  eval_js,
  set_system_property,
  copy,
  on_create,
  on_destroy,
  exit,
  rpc,
} from './functions/core';
import { http_request_form, http_request, http } from './functions/http';
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
  number_is_nan,
} from './functions/number';
import {
  record_delete,
  record_entries,
  record_exclude,
  record_from_entries,
  record_get,
  record_has,
  record_keys,
  record_merge,
  record_set,
  record_values,
} from './functions/record';
import { pg_query } from './functions/pg';
import {
  process_exec,
  process_kill,
  process_pty_create,
  process_pty_resize,
  process_pty_wait,
  process_pty_write,
} from './functions/process';
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
  string_length,
  string_percent_encode,
  string_percent_decode,
} from './functions/string';
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
import {
  stream_create,
  stream_merge,
  stream_read,
  stream_write,
} from './functions/stream';
import {
  skip,
  take,
  filter,
  find,
  find_index,
  map,
  map_parallel,
  flat_map,
  sort,
  reverse,
  reduce,
  contains,
  length,
  unique,
  notify,
} from './functions/util';
import { metadata_set, metadata_get } from './functions/metadata';
import { flex, scroller } from './functions/widget';
import { secret, secret_create } from './functions/secret';
import { ssh_exec, ssh_resize, ssh_wait, ssh_write } from './functions/ssh';
import { wait, sleep, spawn } from './functions/spawn';
import { redis } from './functions/redis';
import { sqlite_query } from './functions/sqlite';
import {
  regexp_find,
  regexp_find_global,
  regexp_find_groups_global,
  regexp_find_groups,
  regexp_test,
} from './functions/regexp';
import { human_date } from './functions/human';

export function importStdlibInContext(ctx: RuntimeContext) {
  ctx.registerFunction(default$);
  ctx.registerFunction(log);
  ctx.registerFunction(copy);
  ctx.registerFunction(throw$);
  ctx.registerFunction(typeof$);
  ctx.registerFunction(on_create);
  ctx.registerFunction(on_destroy);
  ctx.registerFunction(watch);

  ctx.registerFunction(array_append);
  ctx.registerFunction(array_concat);
  ctx.registerFunction(array_contains);
  ctx.registerFunction(array_filter);
  ctx.registerFunction(array_set);
  ctx.registerFunction(array_find);
  ctx.registerFunction(array_find_index);
  ctx.registerFunction(array_flat_map);
  ctx.registerFunction(array_get);
  ctx.registerFunction(array_group);
  ctx.registerFunction(array_group_unique);
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
  ctx.registerFunction(bytes_to_string);
  ctx.registerFunction(bytes_from);
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
  ctx.registerFunction(exit);
  ctx.registerFunction(http_request_form);
  ctx.registerFunction(http_request);
  ctx.registerFunction(http);
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
  ctx.registerFunction(number_is_nan);
  ctx.registerFunction(record_entries);
  ctx.registerFunction(record_from_entries);
  ctx.registerFunction(record_get);
  ctx.registerFunction(record_has);
  ctx.registerFunction(record_keys);
  ctx.registerFunction(record_merge);
  ctx.registerFunction(record_set);
  ctx.registerFunction(record_values);
  ctx.registerFunction(record_delete);
  ctx.registerFunction(record_exclude);
  ctx.registerFunction(pg_query);
  ctx.registerFunction(process_exec);
  ctx.registerFunction(process_pty_create);
  ctx.registerFunction(process_pty_write);
  ctx.registerFunction(process_pty_resize);
  ctx.registerFunction(process_pty_wait);
  ctx.registerFunction(process_kill);
  ctx.registerFunction(redis);
  ctx.registerFunction(regexp_find);
  ctx.registerFunction(regexp_find_global);
  ctx.registerFunction(regexp_find_groups_global);
  ctx.registerFunction(regexp_find_groups);
  ctx.registerFunction(regexp_test);
  ctx.registerFunction(set_system_property);
  ctx.registerFunction(storage_list);
  ctx.registerFunction(storage_read);
  ctx.registerFunction(storage_remove);
  ctx.registerFunction(storage_write);
  ctx.registerFunction(string_contains);
  ctx.registerFunction(string_ends_with);
  ctx.registerFunction(string_format);
  ctx.registerFunction(string_length);
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
  ctx.registerFunction(string_percent_encode);
  ctx.registerFunction(string_percent_decode);
  ctx.registerFunction(string_to_bytes);
  ctx.registerFunction(string_to_number);
  ctx.registerFunction(string_trim);
  ctx.registerFunction(uuid_v4);

  ctx.registerFunction(secret);
  ctx.registerFunction(secret_create);

  ctx.registerFunction(metadata_set);
  ctx.registerFunction(metadata_get);
  ctx.registerFunction(flex);
  ctx.registerFunction(scroller);

  ctx.registerFunction(sqlite_query);

  ctx.registerFunction(stream_create);
  ctx.registerFunction(stream_read);
  ctx.registerFunction(stream_write);
  ctx.registerFunction(stream_merge);

  ctx.registerFunction(ssh_exec);
  ctx.registerFunction(ssh_write);
  ctx.registerFunction(ssh_resize);
  ctx.registerFunction(ssh_wait);

  ctx.registerFunction(spawn);
  ctx.registerFunction(sleep);
  ctx.registerFunction(wait);

  ctx.registerFunction(skip);
  ctx.registerFunction(take);
  ctx.registerFunction(filter);
  ctx.registerFunction(find);
  ctx.registerFunction(find_index);
  ctx.registerFunction(map);
  ctx.registerFunction(map_parallel);
  ctx.registerFunction(flat_map);
  ctx.registerFunction(sort);
  ctx.registerFunction(reverse);
  ctx.registerFunction(reduce);
  ctx.registerFunction(contains);
  ctx.registerFunction(length);
  ctx.registerFunction(unique);
  ctx.registerFunction(notify);
  ctx.registerFunction(rpc);

  ctx.registerFunction(human_date);
}

export { HttpLogItemData } from './functions/http';
export { MongoLogItemData } from './functions/mongodb';
export { PgLogItemData } from './functions/pg';
export { ProcessLogItemData, ProcessPtyObject } from './functions/process';
export { RedisLogItemData } from './functions/redis';
export { base64_to_bytes, bytes_to_base64 } from './util/base64';
export { secretCreate } from './util/secret';
export { SshConnectionObject } from './functions/ssh';
export { MessageStream, MessageStreamSink } from './util/streams';
export { SqliteLogItemData } from './functions/sqlite';
