declare module 'find-free-port' {
  export default function findFreePort(start: number): Promise<number[]>;
}

declare module 'backend' {
  export const server: { close(): void; listen(...args: any[]): void };
  export const config: {
    log: boolean;
  };
}
