import { backendUrl } from "./configuration";

export async function customRpc(
  command: string,
  body: unknown,
  headers: [string, string][] = []
) {
  return fetch(backendUrl + "/op/" + command, {
    method: "post",
    headers: headers,
    // TODO: allow more types to be passed as raw, such as array buffer
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
