/**
 * ZeroBounce Warmup API client.
 *
 * Warmup is a separate product from email validation: its own host
 * (`https://warmup-api.zerobounce.net`), its own team-scoped key sent in an
 * `API-Key` header rather than an `api_key` parameter, and its own class in the
 * ZeroBounce SDK. The main validation key is not valid there, so a Warmup key
 * must be configured separately and the Warmup tools stay unregistered without
 * one.
 *
 * There is no regional Warmup host: `warmup-api-us` and `warmup-api-eu` do not
 * resolve. `baseUrl` exists so tests can point the client at a stub, not so
 * callers can pick a region.
 */

import ZeroBounceSDK from '@zerobounce/zero-bounce-sdk';
import type { ZeroBounceWarmup } from '@zerobounce/zero-bounce-sdk';

export const DEFAULT_WARMUP_BASE_URL = 'https://warmup-api.zerobounce.net';

/**
 * The SDK bundle exposes the Warmup class as a static on the default export
 * rather than as its own named export, so reach it through the class that is
 * already imported instead of a second import that would resolve to
 * `undefined` at runtime.
 */
type WarmupConstructor = new (apiKey: string, baseUrl?: string) => ZeroBounceWarmup;

function warmupConstructor(): WarmupConstructor | undefined {
  const sdk = ZeroBounceSDK as unknown as { Warmup?: WarmupConstructor };
  return typeof sdk.Warmup === 'function' ? sdk.Warmup : undefined;
}

/** Whether the installed ZeroBounce SDK ships the Warmup client at all. */
export function isWarmupSupported(): boolean {
  return warmupConstructor() !== undefined;
}

/** Whether the installed Warmup client implements the given method. */
export function isWarmupMethodAvailable(name: string): boolean {
  const ctor = warmupConstructor();
  return (
    ctor !== undefined &&
    typeof (ctor.prototype as unknown as Record<string, unknown>)?.[name] === 'function'
  );
}

export function createWarmupClient(apiKey: string, baseUrl?: string): ZeroBounceWarmup {
  const Warmup = warmupConstructor();
  if (!Warmup) {
    throw new Error(
      'The Warmup API requires @zerobounce/zero-bounce-sdk with Warmup support (upgrade SDK).'
    );
  }
  return new Warmup(apiKey, baseUrl || DEFAULT_WARMUP_BASE_URL);
}
