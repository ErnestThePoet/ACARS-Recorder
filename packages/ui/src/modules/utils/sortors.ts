import { Maybe } from "./types";

export function stringCompare(a: string, b: string): number {
  return a.localeCompare(b);
}

function getNested<T>(obj: any, keys: string[]): Maybe<T> {
  let result: any = obj;

  for (const key of keys) {
    result = result[key];
  }

  return result as Maybe<T>;
}

function applyReverse(result: number, reverse: boolean) {
  return reverse ? -result : result;
}

export function getStringSorter<T>(
  key: keyof T | string[],
  reverse: boolean = false,
) {
  if (Array.isArray(key)) {
    return (a: T, b: T) =>
      applyReverse(
        stringCompare(getNested(a, key) ?? "", getNested(b, key) ?? ""),
        reverse,
      );
  }

  return (a: T, b: T) =>
    applyReverse(
      stringCompare(
        (a[key] as Maybe<string>) ?? "",
        (b[key] as Maybe<string>) ?? "",
      ),
      reverse,
    );
}

export function getNumberSorter<T>(
  key: keyof T | string[],
  reverse: boolean = false,
) {
  if (Array.isArray(key)) {
    return (a: T, b: T) =>
      applyReverse(
        (getNested<number>(a, key) ?? 0) - (getNested<number>(b, key) ?? 0),
        reverse,
      );
  }

  return (a: T, b: T) =>
    applyReverse(
      ((a[key] as Maybe<number>) ?? 0) - ((b[key] as Maybe<number>) ?? 0),
      reverse,
    );
}
