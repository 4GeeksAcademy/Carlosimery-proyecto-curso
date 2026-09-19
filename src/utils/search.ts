export type Comparator<T> = (first: T, second: T) => number;

export function linearSearch<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => boolean,
): T | undefined {
  for (const [index, item] of items.entries()) {
    if (predicate(item, index)) {
      return item;
    }
  }

  return undefined;
}

export function binarySearch<T, Key>(
  sortedItems: readonly T[],
  target: Key,
  getKey: (item: T) => Key,
  compare: Comparator<Key>,
): T | undefined {
  let lowerBound = 0;
  let upperBound = sortedItems.length - 1;

  while (lowerBound <= upperBound) {
    const middleIndex = lowerBound + Math.floor((upperBound - lowerBound) / 2);
    const currentItem = sortedItems[middleIndex]!;
    const comparison = compare(getKey(currentItem), target);

    if (comparison === 0) {
      return currentItem;
    }

    if (comparison < 0) {
      lowerBound = middleIndex + 1;
    } else {
      upperBound = middleIndex - 1;
    }
  }

  return undefined;
}

export const compareNumbers: Comparator<number> = (first, second) => first - second;

export const compareStrings: Comparator<string> = (first, second) =>
  first.localeCompare(second);