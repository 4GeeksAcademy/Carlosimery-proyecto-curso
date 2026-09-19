import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { InventoryItem, Shipment } from "../types/models.js";
import { filterCollection, groupCollection, sortCollection } from "./collections.js";
import { binarySearch, compareNumbers, linearSearch } from "./search.js";
import { averageBy, countBy, maxBy, minBy, sumBy } from "./transformations.js";
import { validateInventoryItem, validateShipment } from "./validations.js";

const inventory: InventoryItem[] = [
  {
    id: "2",
    sku: "SKU-002",
    name: "Caja",
    category: "packaging",
    warehouseId: "zgz",
    quantity: 5,
    minimumStock: 10,
    unitWeightKg: 0.5,
    unitValue: 2,
    updatedAt: new Date("2026-09-19"),
  },
  {
    id: "1",
    sku: "SKU-001",
    name: "Cinta",
    category: "packaging",
    warehouseId: "lax",
    quantity: 20,
    minimumStock: 5,
    unitWeightKg: 0.2,
    unitValue: 1,
    updatedAt: new Date("2026-09-19"),
  },
];

describe("collection and search utilities", () => {
  it("sorts without mutating and groups by key", () => {
    const sorted = sortCollection(inventory, (first, second) =>
      first.sku.localeCompare(second.sku),
    );

    assert.equal(sorted[0]?.sku, "SKU-001");
    assert.equal(inventory[0]?.sku, "SKU-002");
    assert.equal(groupCollection(inventory, (item) => item.category).get("packaging")?.length, 2);
  });

  it("handles matches, missing values, and empty arrays", () => {
    assert.equal(linearSearch(inventory, (item) => item.sku === "SKU-001")?.id, "1");
    assert.equal(linearSearch(inventory, (item) => item.sku === "missing"), undefined);
    assert.equal(binarySearch([], 1, (value: number) => value, compareNumbers), undefined);
    assert.equal(binarySearch([1, 3, 5], 3, (value) => value, compareNumbers), 3);
    assert.equal(binarySearch([1, 3, 5], 2, (value) => value, compareNumbers), undefined);
    assert.deepEqual(filterCollection([], () => true), []);
    assert.deepEqual(sortCollection([], () => 0), []);
    assert.equal(groupCollection([], (value: number) => value).size, 0);
  });
});

describe("transformations", () => {
  it("calculates reports and preserves empty collection semantics", () => {
    assert.equal(countBy(inventory, (item) => item.category).get("packaging"), 2);
    assert.equal(sumBy(inventory, (item) => item.quantity), 25);
    assert.equal(averageBy(inventory, (item) => item.quantity), 12.5);
    assert.equal(minBy(inventory, (item) => item.quantity)?.id, "2");
    assert.equal(maxBy(inventory, (item) => item.quantity)?.id, "1");
    assert.equal(averageBy([], () => 0), undefined);
    assert.equal(minBy([], () => 0), undefined);
    assert.equal(maxBy([], () => 0), undefined);
    assert.equal(sumBy([], () => 0), 0);
  });
});

describe("business validations", () => {
  it("accepts valid inventory and rejects invalid numeric values", () => {
    const item = inventory[0]!;
    const invalidResult = validateInventoryItem({ ...item, quantity: -1 });

    assert.equal(validateInventoryItem(item).valid, true);
    assert.equal(
      invalidResult.errors[0]?.field,
      "quantity",
    );
  });

  it("requires coherent delivery dates", () => {
    const shipment: Shipment = {
      id: "shipment-1",
      trackingNumber: "TRACK-1",
      warehouseId: "zgz",
      carrierId: "carrier-1",
      destinationCountry: "ES",
      weightKg: 2,
      shippingCost: 8,
      priority: "standard",
      status: "delivered",
      createdAt: new Date("2026-09-19"),
      estimatedDeliveryAt: new Date("2026-09-20"),
    };

    const result = validateShipment(shipment);

    assert.equal(result.valid, false);
    assert.equal(result.errors[0]?.field, "deliveredAt");
  });
});