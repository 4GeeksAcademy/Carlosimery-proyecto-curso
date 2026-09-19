import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  CustomerContract,
  InventoryItem,
  ReturnRequest,
  Shipment,
} from "../types/models.js";
import {
  filterInventory,
  filterShipments,
  sortByCriteria,
} from "./collections.js";
import {
  createInventoryReport,
  createOperationalReport,
} from "./transformations.js";
import {
  validateCarrier,
  validateCarrierPerformance,
  validateCustomer,
  validateCustomerContract,
  validateDeliveryIncident,
  validateInventoryItem,
  validateOrder,
  validateReturnRequest,
  validateShipment,
  validateSupportTicket,
  validateWarehouse,
} from "./validations.js";

const inventory: InventoryItem[] = [
  {
    id: "inventory-1",
    sku: "BOX-1",
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
    id: "inventory-2",
    sku: "TAPE-1",
    name: "Cinta",
    category: "packaging",
    warehouseId: "lax",
    quantity: 20,
    minimumStock: 5,
    unitWeightKg: 0.2,
    unitValue: 1,
    updatedAt: new Date("2026-09-19"),
  },
  {
    id: "inventory-3",
    sku: "LABEL-1",
    name: "Etiqueta",
    category: "labels",
    warehouseId: "zgz",
    quantity: 5,
    minimumStock: 2,
    unitWeightKg: 0.01,
    unitValue: 0.1,
    updatedAt: new Date("2026-09-19"),
  },
];

const shipments: Shipment[] = [
  {
    id: "shipment-1",
    trackingNumber: "TF-001",
    warehouseId: "zgz",
    carrierId: "seur",
    destinationCountry: "ES",
    weightKg: 2,
    shippingCost: 8,
    priority: "express",
    status: "delivered",
    createdAt: new Date("2026-09-17"),
    estimatedDeliveryAt: new Date("2026-09-19"),
    deliveredAt: new Date("2026-09-18"),
  },
  {
    id: "shipment-2",
    trackingNumber: "TF-002",
    warehouseId: "lax",
    carrierId: "ups",
    destinationCountry: "US",
    weightKg: 5,
    shippingCost: 12,
    priority: "standard",
    status: "in_transit",
    createdAt: new Date("2026-09-18"),
    estimatedDeliveryAt: new Date("2026-09-21"),
  },
];

const returns: ReturnRequest[] = [
  {
    id: "return-1",
    shipmentId: "shipment-1",
    customerId: "customer-1",
    productSku: "BOX-1",
    country: "ES",
    reason: "Producto danado",
    status: "pending",
    requestedAt: new Date("2026-09-19"),
  },
];

describe("TrackFlow collection operations", () => {
  it("filters using multiple inventory and shipment criteria", () => {
    assert.deepEqual(
      filterInventory(inventory, {
        warehouseId: "zgz",
        maximumQuantity: 10,
        lowStockOnly: true,
      }).map((item) => item.id),
      ["inventory-1"],
    );
    assert.deepEqual(
      filterShipments(shipments, {
        status: "delivered",
        destinationCountry: "ES",
        maximumWeightKg: 3,
      }).map((shipment) => shipment.id),
      ["shipment-1"],
    );
  });

  it("sorts ascending, descending, and by multiple fields", () => {
    const originalInventory = inventory.map((item) => ({ ...item }));
    const sorted = sortByCriteria(inventory, [
      { getValue: (item) => item.quantity, direction: "descending" },
      { getValue: (item) => item.sku, direction: "ascending" },
    ]);

    assert.deepEqual(sorted.map((item) => item.sku), ["TAPE-1", "BOX-1", "LABEL-1"]);
  assert.deepEqual(inventory, originalInventory);
  });
});

describe("TrackFlow reports", () => {
  it("calculates inventory and executive operational KPIs", () => {
    const inventoryReport = createInventoryReport(inventory);
    const operationalReport = createOperationalReport(shipments, returns);

    assert.equal(inventoryReport.itemCountByCategory.get("packaging"), 2);
    assert.equal(inventoryReport.totalUnits, 30);
    assert.equal(inventoryReport.totalInventoryValue, 30.5);
    assert.equal(operationalReport.shipmentCount, 2);
    assert.equal(operationalReport.onTimeDeliveryRate, 1);
    assert.equal(operationalReport.totalShippingCost, 20);
    assert.equal(operationalReport.returnRate, 0.5);
  });
});

describe("TrackFlow business validation", () => {
  it("returns structured errors for null and undefined entities", () => {
    const validators = [
      validateWarehouse,
      validateInventoryItem,
      validateCarrier,
      validateShipment,
      validateCustomer,
      validateCustomerContract,
      validateOrder,
      validateDeliveryIncident,
      validateReturnRequest,
      validateSupportTicket,
      validateCarrierPerformance,
    ];

    for (const validate of validators) {
      assert.equal(validate(null).valid, false);
      assert.equal(validate(undefined).valid, false);
    }
  });

  it("enforces the two warehouse locations and required active state", () => {
    const validWarehouse = {
      id: "warehouse-zgz",
      name: "TrackFlow Zaragoza",
      city: "Zaragoza" as const,
      country: "ES" as const,
      timeZone: "Europe/Madrid",
      active: true,
    };

    assert.equal(validateWarehouse(validWarehouse).valid, true);
    assert.ok(
      validateWarehouse({ ...validWarehouse, country: "US" }).errors.some(
        (error) => error.field === "country",
      ),
    );
    assert.ok(
      validateWarehouse({
        id: validWarehouse.id,
        name: validWarehouse.name,
        city: validWarehouse.city,
        country: validWarehouse.country,
        timeZone: validWarehouse.timeZone,
      }).errors.some(
        (error) => error.field === "active",
      ),
    );
  });

  it("reports incomplete imported orders without throwing", () => {
    const result = validateOrder({ sourceEmail: "invalid-email", lines: [] });

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.field === "sourceEmail"));
    assert.ok(result.errors.some((error) => error.field === "lines"));
  });

  it("enforces annual contracts and completed return decisions", () => {
    const annualContract: CustomerContract = {
      id: "contract-1",
      customerId: "customer-1",
      startsAt: new Date("2026-01-01"),
      endsAt: new Date("2027-01-01"),
      annualValue: 50_000,
      renewalRiskScore: 0.2,
      active: true,
    };
    const incompleteReturn: ReturnRequest = {
      ...returns[0]!,
      status: "completed",
      decidedAt: new Date("2026-09-20"),
    };

    assert.equal(validateCustomerContract(annualContract).valid, true);
    assert.deepEqual(
      validateReturnRequest(incompleteReturn).errors.map((error) => error.field),
      ["condition", "resolution"],
    );
  });
});