import type {
  Carrier,
  CarrierPerformance,
  Customer,
  CustomerContract,
  DeliveryIncident,
  InventoryItem,
  Order,
  ReturnRequest,
  Shipment,
  SupportTicket,
  Warehouse,
} from "../types/models.js";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateWarehouse(
  warehouse: Partial<Warehouse> | null | undefined,
): ValidationResult {
  if (warehouse == null) {
    return missingEntityResult("warehouse");
  }

  const errors: ValidationError[] = [];

  requireText(warehouse.id, "id", errors);
  requireText(warehouse.name, "name", errors);
  requireOneOf(warehouse.city, "city", ["Los Angeles", "Zaragoza"], errors);
  requireText(warehouse.timeZone, "timeZone", errors);
  requireOneOf(warehouse.country, "country", ["ES", "US"], errors);
  requireBoolean(warehouse.active, "active", errors);

  if (
    warehouse.city !== undefined &&
    warehouse.country !== undefined &&
    !(
      (warehouse.city === "Los Angeles" && warehouse.country === "US") ||
      (warehouse.city === "Zaragoza" && warehouse.country === "ES")
    )
  ) {
    errors.push({
      field: "country",
      message: "Los Angeles pertenece a US y Zaragoza pertenece a ES",
    });
  }

  return resultFrom(errors);
}

export function validateInventoryItem(
  item: Partial<InventoryItem> | null | undefined,
): ValidationResult {
  if (item == null) {
    return missingEntityResult("inventoryItem");
  }

  const errors: ValidationError[] = [];

  requireText(item.id, "id", errors);
  requireText(item.sku, "sku", errors);
  requireText(item.name, "name", errors);
  requireText(item.category, "category", errors);
  requireText(item.warehouseId, "warehouseId", errors);
  requirePositiveInteger(item.quantity, "quantity", errors, true);
  requirePositiveInteger(item.minimumStock, "minimumStock", errors, true);
  requirePositiveNumber(item.unitWeightKg, "unitWeightKg", errors);
  requireNonNegativeNumber(item.unitValue, "unitValue", errors);
  requireValidDate(item.updatedAt, "updatedAt", errors);

  return resultFrom(errors);
}

export function validateCarrier(
  carrier: Partial<Carrier> | null | undefined,
): ValidationResult {
  if (carrier == null) {
    return missingEntityResult("carrier");
  }

  const errors: ValidationError[] = [];

  requireText(carrier.id, "id", errors);
  requireText(carrier.name, "name", errors);
  requireNonNegativeNumber(carrier.costPerKg, "costPerKg", errors);
  requireNumberInRange(
    carrier.onTimeDeliveryRate,
    "onTimeDeliveryRate",
    0,
    1,
    errors,
  );

  if (!carrier.countries || carrier.countries.length === 0) {
    errors.push({ field: "countries", message: "Debe incluir al menos un pais" });
  } else {
    for (const [index, country] of carrier.countries.entries()) {
      requireOneOf(country, `countries.${index}`, ["ES", "US"], errors);
    }
  }

  requireBoolean(carrier.active, "active", errors);

  return resultFrom(errors);
}

export function validateShipment(
  shipment: Partial<Shipment> | null | undefined,
): ValidationResult {
  if (shipment == null) {
    return missingEntityResult("shipment");
  }

  const errors: ValidationError[] = [];

  requireText(shipment.id, "id", errors);
  requireText(shipment.trackingNumber, "trackingNumber", errors);
  requireText(shipment.warehouseId, "warehouseId", errors);
  requireText(shipment.carrierId, "carrierId", errors);
  requireOneOf(shipment.destinationCountry, "destinationCountry", ["ES", "US"], errors);
  requireOneOf(shipment.priority, "priority", ["standard", "express"], errors);
  requireOneOf(
    shipment.status,
    "status",
    ["pending", "in_transit", "delivered", "cancelled"],
    errors,
  );
  requirePositiveNumber(shipment.weightKg, "weightKg", errors);
  requireNonNegativeNumber(shipment.shippingCost, "shippingCost", errors);
  requireValidDate(shipment.createdAt, "createdAt", errors);
  requireValidDate(shipment.estimatedDeliveryAt, "estimatedDeliveryAt", errors);

  if (
    isValidDate(shipment.createdAt) &&
    isValidDate(shipment.estimatedDeliveryAt) &&
    shipment.estimatedDeliveryAt < shipment.createdAt
  ) {
    errors.push({
      field: "estimatedDeliveryAt",
      message: "La entrega estimada no puede ser anterior a la creacion",
    });
  }

  if (shipment.status === "delivered" && !shipment.deliveredAt) {
    errors.push({
      field: "deliveredAt",
      message: "Un envio entregado debe tener fecha de entrega",
    });
  }

  if (shipment.deliveredAt) {
    requireValidDate(shipment.deliveredAt, "deliveredAt", errors);

    if (
      isValidDate(shipment.deliveredAt) &&
      isValidDate(shipment.createdAt) &&
      shipment.deliveredAt < shipment.createdAt
    ) {
      errors.push({
        field: "deliveredAt",
        message: "La entrega no puede ser anterior a la creacion",
      });
    }
  }

  return resultFrom(errors);
}

export function validateCustomer(
  customer: Partial<Customer> | null | undefined,
): ValidationResult {
  if (customer == null) {
    return missingEntityResult("customer");
  }

  const errors: ValidationError[] = [];

  requireText(customer.id, "id", errors);
  requireText(customer.name, "name", errors);
  requireOneOf(customer.type, "type", ["brand", "consumer"], errors);
  requireEmail(customer.email, "email", errors);
  requireOneOf(customer.country, "country", ["ES", "US"], errors);
  requireOneOf(customer.preferredLanguage, "preferredLanguage", ["es", "en"], errors);
  requireBoolean(customer.active, "active", errors);

  return resultFrom(errors);
}

export function validateCustomerContract(
  contract: Partial<CustomerContract> | null | undefined,
): ValidationResult {
  if (contract == null) {
    return missingEntityResult("customerContract");
  }

  const errors: ValidationError[] = [];

  requireText(contract.id, "id", errors);
  requireText(contract.customerId, "customerId", errors);
  requireValidDate(contract.startsAt, "startsAt", errors);
  requireValidDate(contract.endsAt, "endsAt", errors);
  requireNonNegativeNumber(contract.annualValue, "annualValue", errors);
  requireNumberInRange(contract.renewalRiskScore, "renewalRiskScore", 0, 1, errors);
  requireBoolean(contract.active, "active", errors);

  if (isValidDate(contract.startsAt) && isValidDate(contract.endsAt)) {
    const durationInDays =
      (contract.endsAt.getTime() - contract.startsAt.getTime()) / 86_400_000;

    if (durationInDays < 364 || durationInDays > 366) {
      errors.push({
        field: "endsAt",
        message: "Los contratos de TrackFlow deben tener una duracion anual",
      });
    }
  }

  return resultFrom(errors);
}

export function validateOrder(
  order: Partial<Order> | null | undefined,
): ValidationResult {
  if (order == null) {
    return missingEntityResult("order");
  }

  const errors: ValidationError[] = [];

  requireText(order.id, "id", errors);
  requireText(order.customerId, "customerId", errors);
  requireText(order.warehouseId, "warehouseId", errors);
  requireEmail(order.sourceEmail, "sourceEmail", errors);
  requireOneOf(order.priority, "priority", ["standard", "express"], errors);
  requireOneOf(
    order.status,
    "status",
    ["received", "picking", "packed", "dispatched", "cancelled"],
    errors,
  );
  requireValidDate(order.createdAt, "createdAt", errors);

  if (!order.destination) {
    errors.push({ field: "destination", message: "El destino es obligatorio" });
  } else {
    requireText(order.destination.street, "destination.street", errors);
    requireText(order.destination.city, "destination.city", errors);
    requireText(order.destination.postalCode, "destination.postalCode", errors);
    requireOneOf(
      order.destination.country,
      "destination.country",
      ["ES", "US"],
      errors,
    );
  }

  if (!order.lines || order.lines.length === 0) {
    errors.push({ field: "lines", message: "El pedido debe incluir al menos un producto" });
  } else {
    for (const [index, line] of order.lines.entries()) {
      requireText(line.sku, `lines.${index}.sku`, errors);
      requirePositiveInteger(line.quantity, `lines.${index}.quantity`, errors);
      requirePositiveNumber(line.unitWeightKg, `lines.${index}.unitWeightKg`, errors);
    }
  }

  return resultFrom(errors);
}

export function validateDeliveryIncident(
  incident: Partial<DeliveryIncident> | null | undefined,
): ValidationResult {
  if (incident == null) {
    return missingEntityResult("deliveryIncident");
  }

  const errors: ValidationError[] = [];

  requireText(incident.id, "id", errors);
  requireText(incident.shipmentId, "shipmentId", errors);
  requireOneOf(
    incident.type,
    "type",
    ["lost_package", "failed_delivery", "incorrect_address"],
    errors,
  );
  requireOneOf(
    incident.status,
    "status",
    ["open", "investigating", "resolved"],
    errors,
  );
  requireText(incident.route, "route", errors);
  requireText(incident.description, "description", errors);
  requireValidDate(incident.reportedAt, "reportedAt", errors);

  if (incident.status === "resolved" && !incident.resolvedAt) {
    errors.push({ field: "resolvedAt", message: "Una incidencia resuelta requiere fecha" });
  }

  validateChronology(incident.reportedAt, incident.resolvedAt, "resolvedAt", errors);
  return resultFrom(errors);
}

export function validateReturnRequest(
  returnRequest: Partial<ReturnRequest> | null | undefined,
): ValidationResult {
  if (returnRequest == null) {
    return missingEntityResult("returnRequest");
  }

  const errors: ValidationError[] = [];

  requireText(returnRequest.id, "id", errors);
  requireText(returnRequest.shipmentId, "shipmentId", errors);
  requireText(returnRequest.customerId, "customerId", errors);
  requireText(returnRequest.productSku, "productSku", errors);
  requireOneOf(returnRequest.country, "country", ["ES", "US"], errors);
  requireText(returnRequest.reason, "reason", errors);
  requireOneOf(
    returnRequest.status,
    "status",
    ["pending", "approved", "rejected", "collected", "inspected", "completed"],
    errors,
  );
  requireValidDate(returnRequest.requestedAt, "requestedAt", errors);

  if (["approved", "rejected", "collected", "inspected", "completed"].includes(returnRequest.status ?? "") && !returnRequest.decidedAt) {
    errors.push({ field: "decidedAt", message: "La devolucion decidida requiere fecha" });
  }

  if (["inspected", "completed"].includes(returnRequest.status ?? "") && !returnRequest.condition) {
    errors.push({ field: "condition", message: "La devolucion inspeccionada requiere estado del producto" });
  }

  if (returnRequest.status === "completed" && !returnRequest.resolution) {
    errors.push({ field: "resolution", message: "La devolucion completada requiere resolucion" });
  }

  if (returnRequest.condition !== undefined) {
    requireOneOf(
      returnRequest.condition,
      "condition",
      ["new", "refurbishable", "damaged", "discard"],
      errors,
    );
  }

  if (returnRequest.resolution !== undefined) {
    requireOneOf(
      returnRequest.resolution,
      "resolution",
      ["restock", "refurbish", "discard"],
      errors,
    );
  }

  validateChronology(returnRequest.requestedAt, returnRequest.decidedAt, "decidedAt", errors);
  return resultFrom(errors);
}

export function validateSupportTicket(
  ticket: Partial<SupportTicket> | null | undefined,
): ValidationResult {
  if (ticket == null) {
    return missingEntityResult("supportTicket");
  }

  const errors: ValidationError[] = [];

  requireText(ticket.id, "id", errors);
  requireText(ticket.customerId, "customerId", errors);
  requireOneOf(ticket.customerType, "customerType", ["brand", "consumer"], errors);
  requireOneOf(ticket.channel, "channel", ["email", "whatsapp", "phone"], errors);
  requireOneOf(ticket.language, "language", ["es", "en"], errors);
  requireText(ticket.subject, "subject", errors);
  requireOneOf(ticket.status, "status", ["open", "in_progress", "resolved"], errors);
  requireNumberInRange(ticket.sentimentScore, "sentimentScore", -1, 1, errors);
  requireValidDate(ticket.createdAt, "createdAt", errors);

  if (ticket.status === "resolved" && !ticket.resolvedAt) {
    errors.push({ field: "resolvedAt", message: "Un ticket resuelto requiere fecha" });
  }

  validateChronology(ticket.createdAt, ticket.resolvedAt, "resolvedAt", errors);
  return resultFrom(errors);
}

export function validateCarrierPerformance(
  performance: Partial<CarrierPerformance> | null | undefined,
): ValidationResult {
  if (performance == null) {
    return missingEntityResult("carrierPerformance");
  }

  const errors: ValidationError[] = [];

  requireText(performance.carrierId, "carrierId", errors);
  requireOneOf(performance.country, "country", ["ES", "US"], errors);
  requireText(performance.route, "route", errors);
  requirePositiveInteger(performance.shipmentCount, "shipmentCount", errors, true);
  requireNumberInRange(performance.onTimeDeliveryRate, "onTimeDeliveryRate", 0, 1, errors);
  requirePositiveInteger(performance.incidentCount, "incidentCount", errors, true);
  requireNonNegativeNumber(performance.totalCost, "totalCost", errors);
  requireNonNegativeNumber(performance.totalWeightKg, "totalWeightKg", errors);
  requireValidDate(performance.periodStart, "periodStart", errors);
  requireValidDate(performance.periodEnd, "periodEnd", errors);
  validateChronology(performance.periodStart, performance.periodEnd, "periodEnd", errors);

  return resultFrom(errors);
}

function requireText(
  value: unknown,
  field: string,
  errors: ValidationError[],
): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push({ field, message: "El campo es obligatorio" });
  }
}

function requireBoolean(
  value: unknown,
  field: string,
  errors: ValidationError[],
): void {
  if (typeof value !== "boolean") {
    errors.push({ field, message: "Debe ser un valor booleano" });
  }
}

function requireOneOf<Value extends string>(
  value: unknown,
  field: string,
  allowedValues: readonly Value[],
  errors: ValidationError[],
): void {
  if (typeof value !== "string" || !allowedValues.includes(value as Value)) {
    errors.push({
      field,
      message: `Debe ser uno de estos valores: ${allowedValues.join(", ")}`,
    });
  }
}

function requireNumberInRange(
  value: unknown,
  field: string,
  minimum: number,
  maximum: number,
  errors: ValidationError[],
): void {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    errors.push({
      field,
      message: `Debe ser un numero entre ${minimum} y ${maximum}`,
    });
  }
}

function requireNonNegativeNumber(
  value: unknown,
  field: string,
  errors: ValidationError[],
): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    errors.push({ field, message: "Debe ser un numero mayor o igual que 0" });
  }
}

function requirePositiveNumber(
  value: unknown,
  field: string,
  errors: ValidationError[],
): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    errors.push({ field, message: "Debe ser un numero mayor que 0" });
  }
}

function requireValidDate(
  value: unknown,
  field: string,
  errors: ValidationError[],
): void {
  if (!isValidDate(value)) {
    errors.push({ field, message: "Debe ser una fecha valida" });
  }
}

function requireEmail(
  value: unknown,
  field: string,
  errors: ValidationError[],
): void {
  if (
    typeof value !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    errors.push({ field, message: "Debe ser un email valido" });
  }
}

function requirePositiveInteger(
  value: unknown,
  field: string,
  errors: ValidationError[],
  allowZero = false,
): void {
  const minimum = allowZero ? 0 : 1;

  if (typeof value !== "number" || !Number.isInteger(value) || value < minimum) {
    errors.push({ field, message: `Debe ser un entero mayor o igual que ${minimum}` });
  }
}

function validateChronology(
  start: unknown,
  end: unknown,
  endField: string,
  errors: ValidationError[],
): void {
  if (isValidDate(start) && isValidDate(end) && end < start) {
    errors.push({
      field: endField,
      message: "La fecha final no puede ser anterior a la fecha inicial",
    });
  }
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function missingEntityResult(field: string): ValidationResult {
  return {
    valid: false,
    errors: [{ field, message: "El objeto es obligatorio" }],
  };
}

function resultFrom(errors: ValidationError[]): ValidationResult {
  return { valid: errors.length === 0, errors };
}