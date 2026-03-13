/// <reference path="../.astro/types.d.ts" />

interface AnalyticsEngineDataset {
  writeDataPoint(event: {
    indexes?: string[];
    doubles?: number[];
    blobs?: (string | ArrayBuffer | null)[];
  }): void;
}

type RuntimeEnv = {
  PAGE_VIEWS?: AnalyticsEngineDataset;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
};

declare namespace App {
  interface Locals {
    runtime: {
      env: RuntimeEnv;
    };
  }
}
