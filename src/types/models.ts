export type Identifier = string;
export type CountryCode = "ES" | "US";
export type WarehouseCity = "Los Angeles" | "Zaragoza";
export type LanguageCode = "es" | "en";
export type ShipmentPriority = "standard" | "express";
export type ShipmentStatus =
  | "pending"
  | "in_transit"
  | "delivered"
  | "cancelled";
export type OrderStatus = "received" | "picking" | "packed" | "dispatched" | "cancelled";
export type IncidentType = "lost_package" | "failed_delivery" | "incorrect_address";
export type IncidentStatus = "open" | "investigating" | "resolved";
export type ReturnStatus = "pending" | "approved" | "rejected" | "collected" | "inspected" | "completed";
export type ProductCondition = "new" | "refurbishable" | "damaged" | "discard";
export type ReturnResolution = "restock" | "refurbish" | "discard";
export type CustomerType = "brand" | "consumer";
export type TicketChannel = "email" | "whatsapp" | "phone";
export type TicketStatus = "open" | "in_progress" | "resolved";

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: CountryCode;
}

export interface Warehouse {
  id: Identifier;
  name: string;
  country: CountryCode;
  city: WarehouseCity;
  timeZone: string;
  active: boolean;
}

export interface InventoryItem {
  id: Identifier;
  sku: string;
  name: string;
  category: string;
  warehouseId: Identifier;
  quantity: number;
  minimumStock: number;
  unitWeightKg: number;
  unitValue: number;
  updatedAt: Date;
}

export interface Customer {
  id: Identifier;
  type: CustomerType;
  name: string;
  email: string;
  country: CountryCode;
  preferredLanguage: LanguageCode;
  active: boolean;
}

export interface CustomerContract {
  id: Identifier;
  customerId: Identifier;
  startsAt: Date;
  endsAt: Date;
  annualValue: number;
  renewalRiskScore: number;
  active: boolean;
}

export interface OrderLine {
  sku: string;
  quantity: number;
  unitWeightKg: number;
}

export interface Order {
  id: Identifier;
  customerId: Identifier;
  warehouseId: Identifier;
  sourceEmail: string;
  destination: Address;
  lines: OrderLine[];
  priority: ShipmentPriority;
  status: OrderStatus;
  createdAt: Date;
}

export interface Carrier {
  id: Identifier;
  name: string;
  countries: CountryCode[];
  costPerKg: number;
  onTimeDeliveryRate: number;
  active: boolean;
}

export interface Shipment {
  id: Identifier;
  trackingNumber: string;
  warehouseId: Identifier;
  carrierId: Identifier;
  destinationCountry: CountryCode;
  weightKg: number;
  shippingCost: number;
  priority: ShipmentPriority;
  status: ShipmentStatus;
  createdAt: Date;
  estimatedDeliveryAt: Date;
  deliveredAt?: Date;
}

export interface DeliveryIncident {
  id: Identifier;
  shipmentId: Identifier;
  type: IncidentType;
  status: IncidentStatus;
  route: string;
  description: string;
  reportedAt: Date;
  resolvedAt?: Date;
}

export interface ReturnRequest {
  id: Identifier;
  shipmentId: Identifier;
  customerId: Identifier;
  productSku: string;
  country: CountryCode;
  reason: string;
  status: ReturnStatus;
  requestedAt: Date;
  decidedAt?: Date;
  condition?: ProductCondition;
  resolution?: ReturnResolution;
}

export interface SupportTicket {
  id: Identifier;
  customerId: Identifier;
  customerType: CustomerType;
  channel: TicketChannel;
  language: LanguageCode;
  subject: string;
  status: TicketStatus;
  sentimentScore: number;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface CarrierPerformance {
  carrierId: Identifier;
  country: CountryCode;
  route: string;
  shipmentCount: number;
  onTimeDeliveryRate: number;
  incidentCount: number;
  totalCost: number;
  totalWeightKg: number;
  periodStart: Date;
  periodEnd: Date;
}

export const zaragozaWarehouse: Warehouse = {
  id: "warehouse-zgz",
  name: "TrackFlow Zaragoza",
  country: "ES",
  city: "Zaragoza",
  timeZone: "Europe/Madrid",
  active: true,
};

export const exampleInventoryItem: InventoryItem = {
  id: "inventory-001",
  sku: "TF-BOX-001",
  name: "Caja de envio mediana",
  category: "packaging",
  warehouseId: zaragozaWarehouse.id,
  quantity: 120,
  minimumStock: 25,
  unitWeightKg: 0.35,
  unitValue: 1.5,
  updatedAt: new Date("2026-09-19T08:00:00Z"),
};

export function getAvailableStock(item: InventoryItem): number {
  return Math.max(0, item.quantity);
}

export function isLowStock(item: InventoryItem): boolean {
  return item.quantity <= item.minimumStock;
}

export function calculateShipmentCost(
  carrier: Carrier,
  weightKg: number,
): number {
  return carrier.costPerKg * weightKg;
}