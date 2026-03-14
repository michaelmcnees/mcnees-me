/// <reference path="../.astro/types.d.ts" />

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  first<T = unknown>(column?: string): Promise<T | null>;
}

interface D1Result {
  success: boolean;
}

type RuntimeEnv = {
  PAGE_VIEWS_DB?: D1Database;
};

declare namespace App {
  interface Locals {
    runtime: {
      env: RuntimeEnv;
    };
  }
}
