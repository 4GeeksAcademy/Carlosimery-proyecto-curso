import type {
  InventoryItem,
  ReturnRequest,
  Shipment,
} from "../types/models.js";

export interface InventoryReport {
  itemCountByCategory: Map<string, number>;
  totalUnits: number;
  totalInventoryValue: number;
  averageUnitsPerItem: number | undefined;
  lowestStockItem: InventoryItem | undefined;
  highestStockItem: InventoryItem | undefined;
}

export interface OperationalReport {
  shipmentCount: number;
  deliveredShipmentCount: number;
  onTimeDeliveryRate: number | undefined;
  totalShippingCost: number;
  averageShippingCost: number | undefined;
  returnCount: number;
  returnRate: number | undefined;
}

export function countBy<T, Key>(
  items: readonly T[],
  getKey: (item: T) => Key,
): Map<Key, number> {
  const counts = new Map<Key, number>();

  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

export function sumBy<T>(
  items: readonly T[],
  getValue: (item: T) => number,
): number {
  return items.reduce((total, item) => total + getValue(item), 0);
}

export function minBy<T>(
  items: readonly T[],
  getValue: (item: T) => number,
): T | undefined {
  return selectByValue(items, getValue, (candidate, selected) => candidate < selected);
}

export function maxBy<T>(
  items: readonly T[],
  getValue: (item: T) => number,
): T | undefined {
  return selectByValue(items, getValue, (candidate, selected) => candidate > selected);
}

export function averageBy<T>(
  items: readonly T[],
  getValue: (item: T) => number,
): number | undefined {
  if (items.length === 0) {
    return undefined;
  }

  return sumBy(items, getValue) / items.length;
}

export function createInventoryReport(
  items: readonly InventoryItem[],
): InventoryReport {
  return {
    itemCountByCategory: countBy(items, (item) => item.category),
    totalUnits: sumBy(items, (item) => item.quantity),
    totalInventoryValue: sumBy(
      items,
      (item) => item.quantity * item.unitValue,
    ),
    averageUnitsPerItem: averageBy(items, (item) => item.quantity),
    lowestStockItem: minBy(items, (item) => item.quantity),
    highestStockItem: maxBy(items, (item) => item.quantity),
  };
}

export function createOperationalReport(
  shipments: readonly Shipment[],
  returns: readonly ReturnRequest[],
): OperationalReport {
  const deliveredShipments = shipments.filter(
    (shipment): shipment is Shipment & { deliveredAt: Date } =>
      shipment.status === "delivered" && shipment.deliveredAt !== undefined,
  );
  const onTimeDeliveries = deliveredShipments.filter(
    (shipment) => shipment.deliveredAt <= shipment.estimatedDeliveryAt,
  ).length;

  return {
    shipmentCount: shipments.length,
    deliveredShipmentCount: deliveredShipments.length,
    onTimeDeliveryRate: divideOrUndefined(
      onTimeDeliveries,
      deliveredShipments.length,
    ),
    totalShippingCost: sumBy(shipments, (shipment) => shipment.shippingCost),
    averageShippingCost: averageBy(
      shipments,
      (shipment) => shipment.shippingCost,
    ),
    returnCount: returns.length,
    returnRate: divideOrUndefined(returns.length, shipments.length),
  };
}

function selectByValue<T>(
  items: readonly T[],
  getValue: (item: T) => number,
  shouldReplace: (candidate: number, selected: number) => boolean,
): T | undefined {
  if (items.length === 0) {
    return undefined;
  }

  let selected = items[0]!;

  for (let index = 1; index < items.length; index += 1) {
    const candidate = items[index]!;

    if (shouldReplace(getValue(candidate), getValue(selected))) {
      selected = candidate;
    }
  }

  return selected;
}

function divideOrUndefined(
  numerator: number,
  denominator: number,
): number | undefined {
  return denominator === 0 ? undefined : numerator / denominator;
}