import { customRpc } from '../util/custom-rpc';
import {
  defineFunction3,
  RuntimeContext,
  typeArray,
  typeBoolean,
  typeBytes,
  typeFunction,
  typeNull,
  typeString,
  typeUnion,
} from 'tal-eval';

export const redis = defineFunction3(
  'redis',
  [
    { name: 'url' },
    { name: 'command' },
    { name: 'args' },
    { name: 'insecure' },
  ],
  typeFunction(
    [
      { name: 'url', type: typeString() },
      { name: 'command', type: typeString() },
      { name: 'args', type: typeUnion(typeNull(), typeArray(typeString())) },
      { name: 'insecure', type: typeUnion(typeNull(), typeBoolean()) },
    ],
    [],
    typeBytes()
  ),
  undefined,
  redis_impl,
  {
    description: 'Execute a Redis command',
    parameters: {
      url: 'Connection URL',
      command: 'Command to execute',
      args: 'Array of command arguments',
      insecure: 'Whether to use insecure connection',
    },
    returns: 'Command result as bytes',
  }
);

export type RedisLogItemData = {
  url: string;
  insecure: boolean;
  command: string;
  args: string[];
  result?: any;
  stage: 'pending' | 'fulfilled' | 'rejected';
};

async function redis_impl(_ctx: RuntimeContext, value: { [key: string]: any }) {
  const logItemData: RedisLogItemData = {
    url: value.url,
    args: value.args,
    command: value.command,
    insecure: value.insecure,
    stage: 'pending',
  };
  const logItem = _ctx.log('redis', logItemData);
  try {
    const response = await redisCommand({
      url: value.url,
      command: value.command,
      args: value.args,
      insecure: value.insecure,
    });
    logItem.data.result = response;
    logItem.data.stage = 'fulfilled';
    return response;
  } catch (e) {
    logItem.data.stage = 'rejected';
    throw e;
  }
}

async function redisCommand(params: {
  url: string;
  command: string;
  args: string[];
  insecure: boolean;
}) {
  const response = await customRpc('redis', params);
  if (response.status === 500) {
    const errorJson = await response.json();
    throw new Error(errorJson.message);
  }
  return response.arrayBuffer();
}
