import type {
  Carrier,
  CountryCode,
  InventoryItem,
  ReturnRequest,
  ReturnStatus,
  Shipment,
  ShipmentPriority,
  ShipmentStatus,
} from "../types/models.js";

export type SortDirection = "ascending" | "descending";
export type SortableValue = string | number | boolean | Date;

export interface SortCriterion<T> {
  getValue: (item: T) => SortableValue;
  direction: SortDirection;
}

export interface InventoryFilterCriteria {
  category?: string;
  warehouseId?: string;
  minimumQuantity?: number;
  maximumQuantity?: number;
  lowStockOnly?: boolean;
}

export interface ShipmentFilterCriteria {
  status?: ShipmentStatus;
  priority?: ShipmentPriority;
  destinationCountry?: CountryCode;
  carrierId?: string;
  minimumWeightKg?: number;
  maximumWeightKg?: number;
  createdFrom?: Date;
  createdUntil?: Date;
}

export interface CarrierFilterCriteria {
  country?: CountryCode;
  active?: boolean;
  maximumCostPerKg?: number;
  minimumOnTimeDeliveryRate?: number;
}

export interface ReturnFilterCriteria {
  status?: ReturnStatus;
  country?: CountryCode;
  customerId?: string;
  productSku?: string;
}

export function filterCollection<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => boolean,
): T[] {
  return items.filter(predicate);
}

export function sortCollection<T>(
  items: readonly T[],
  compare: (first: T, second: T) => number,
): T[] {
  return [...items].sort(compare);
}

export function sortByCriteria<T>(
  items: readonly T[],
  criteria: readonly SortCriterion<T>[],
): T[] {
  return sortCollection(items, (first, second) => {
    for (const criterion of criteria) {
      const comparison = compareSortableValues(
        criterion.getValue(first),
        criterion.getValue(second),
      );

      if (comparison !== 0) {
        return criterion.direction === "ascending" ? comparison : -comparison;
      }
    }

    return 0;
  });
}

export function filterInventory(
  items: readonly InventoryItem[],
  criteria: InventoryFilterCriteria,
): InventoryItem[] {
  return filterCollection(items, (item) =>
    (criteria.category === undefined || item.category === criteria.category) &&
    (criteria.warehouseId === undefined || item.warehouseId === criteria.warehouseId) &&
    (criteria.minimumQuantity === undefined || item.quantity >= criteria.minimumQuantity) &&
    (criteria.maximumQuantity === undefined || item.quantity <= criteria.maximumQuantity) &&
    (criteria.lowStockOnly !== true || item.quantity <= item.minimumStock),
  );
}

export function filterShipments(
  shipments: readonly Shipment[],
  criteria: ShipmentFilterCriteria,
): Shipment[] {
  return filterCollection(shipments, (shipment) =>
    (criteria.status === undefined || shipment.status === criteria.status) &&
    (criteria.priority === undefined || shipment.priority === criteria.priority) &&
    (criteria.destinationCountry === undefined ||
      shipment.destinationCountry === criteria.destinationCountry) &&
    (criteria.carrierId === undefined || shipment.carrierId === criteria.carrierId) &&
    (criteria.minimumWeightKg === undefined ||
      shipment.weightKg >= criteria.minimumWeightKg) &&
    (criteria.maximumWeightKg === undefined ||
      shipment.weightKg <= criteria.maximumWeightKg) &&
    (criteria.createdFrom === undefined || shipment.createdAt >= criteria.createdFrom) &&
    (criteria.createdUntil === undefined || shipment.createdAt <= criteria.createdUntil),
  );
}

export function filterCarriers(
  carriers: readonly Carrier[],
  criteria: CarrierFilterCriteria,
): Carrier[] {
  return filterCollection(carriers, (carrier) =>
    (criteria.country === undefined || carrier.countries.includes(criteria.country)) &&
    (criteria.active === undefined || carrier.active === criteria.active) &&
    (criteria.maximumCostPerKg === undefined ||
      carrier.costPerKg <= criteria.maximumCostPerKg) &&
    (criteria.minimumOnTimeDeliveryRate === undefined ||
      carrier.onTimeDeliveryRate >= criteria.minimumOnTimeDeliveryRate),
  );
}

export function filterReturns(
  returns: readonly ReturnRequest[],
  criteria: ReturnFilterCriteria,
): ReturnRequest[] {
  return filterCollection(returns, (returnRequest) =>
    (criteria.status === undefined || returnRequest.status === criteria.status) &&
    (criteria.country === undefined || returnRequest.country === criteria.country) &&
    (criteria.customerId === undefined || returnRequest.customerId === criteria.customerId) &&
    (criteria.productSku === undefined || returnRequest.productSku === criteria.productSku),
  );
}

export function groupCollection<T, Key>(
  items: readonly T[],
  getKey: (item: T) => Key,
): Map<Key, T[]> {
  const groups = new Map<Key, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key);

    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return groups;
}

function compareSortableValues(first: SortableValue, second: SortableValue): number {
  const firstValue = first instanceof Date ? first.getTime() : first;
  const secondValue = second instanceof Date ? second.getTime() : second;

  if (firstValue < secondValue) {
    return -1;
  }

  if (firstValue > secondValue) {
    return 1;
  }

  return 0;
}