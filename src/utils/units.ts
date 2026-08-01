/**
 * Shared unit conversion helpers.
 *
 * RPTR is an 18-decimal token. The rest of the codebase divided raw wei values
 * by ad-hoc 10**6 / 10**9 / 1e18 constants with no rhyme or reason; those
 * conversions now live here so a mistake can be fixed in one place.
 */

import * as web3 from 'web3-utils';

/** RPTR and its LP tokens are all 18-decimal ERC-20s. */
export const RPTR_DECIMALS = 18;

/**
 * Convert a raw on-chain (wei) amount into a display amount with `decimals`.
 * Accepts either a number (as returned by `.call()`) or a string.
 */
export function fromRawUnits(amount: number | string, decimals: number = RPTR_DECIMALS): number {
	return Number(web3.fromWei(String(amount), decimalsToUnit(decimals)));
}

/** Convert a user-facing amount into raw wei units (string, safe for BigInt math). */
export function toRawUnits(amount: number | string, decimals: number = RPTR_DECIMALS): string {
	return web3.toWei(String(amount), decimalsToUnit(decimals));
}

/** Same as `fromRawUnits` but with the default 18 decimals. */
export function fromRaw(amount: number | string): number {
	return fromRawUnits(amount, RPTR_DECIMALS);
}

/** Same as `toRawUnits` but with the default 18 decimals. */
export function toRaw(amount: number | string): string {
	return toRawUnits(amount, RPTR_DECIMALS);
}

/**
 * web3-utils only knows a fixed set of unit names; map our decimal count onto
 * the closest unit. 18 -> 'ether' is exact, and anything else falls back to
 * wei-shifting (web3's fromWei/toWei accept arbitrary unit strings like 'gwei').
 */
function decimalsToUnit(decimals: number): string {
	if (decimals === 18) return 'ether';
	// web3 accepts "gwei" (9), "mwei" (6), "kwei" (3), etc.
	if (decimals === 9) return 'gwei';
	if (decimals === 6) return 'mwei';
	if (decimals === 3) return 'kwei';
	// For any other decimal count we can't express it with a named unit.
	throw new Error(`No web3 unit for ${decimals} decimals`);
}
