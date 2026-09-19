import type {
  InventoryItem,
  ReturnRequest,
  Shipment,
} from "./types/models.js";
import type {
  SortCriterion,
  SortDirection,
} from "./utils/collections.js";
import {
  filterInventory,
  sortByCriteria,
} from "./utils/collections.js";
import {
  binarySearch,
  compareStrings,
  linearSearch,
} from "./utils/search.js";
import {
  createInventoryReport,
  createOperationalReport,
} from "./utils/transformations.js";

declare global {
  interface Window {
    lucide?: { createIcons: () => void };
  }
}

const inventory: InventoryItem[] = [
  inventoryItem("inv-1", "TF-BOX-010", "Caja pequena", "Embalaje", "warehouse-zgz", 8, 12, 0.25, 1.2),
  inventoryItem("inv-2", "TF-BOX-020", "Caja mediana", "Embalaje", "warehouse-zgz", 64, 15, 0.4, 1.8),
  inventoryItem("inv-3", "TF-TAPE-015", "Cinta reforzada", "Consumibles", "warehouse-lax", 120, 30, 0.3, 2.4),
  inventoryItem("inv-4", "TF-LABEL-040", "Etiqueta termica", "Etiquetado", "warehouse-zgz", 18, 25, 0.01, 0.12),
  inventoryItem("inv-5", "TF-WRAP-030", "Film protector", "Consumibles", "warehouse-lax", 42, 20, 1.1, 7.5),
  inventoryItem("inv-6", "TF-PALLET-050", "Palet europeo", "Almacenaje", "warehouse-zgz", 6, 8, 25, 18),
];

const shipments: Shipment[] = [
  shipment("SHP-1001", "SEUR-8842", "warehouse-zgz", "seur", "ES", 2.4, 8.6, "express", "delivered", "2026-09-12", "2026-09-14", "2026-09-13"),
  shipment("SHP-1002", "UPS-7741", "warehouse-lax", "ups", "US", 8.2, 24.9, "standard", "in_transit", "2026-09-16", "2026-09-21"),
  shipment("SHP-1003", "MRW-5520", "warehouse-zgz", "mrw", "ES", 1.1, 6.4, "standard", "delivered", "2026-09-10", "2026-09-13", "2026-09-14"),
  shipment("SHP-1004", "FDX-2318", "warehouse-lax", "fedex", "US", 12.7, 38.2, "express", "pending", "2026-09-18", "2026-09-20"),
  shipment("SHP-1005", "DHL-9934", "warehouse-zgz", "dhl", "ES", 4.5, 14.1, "express", "delivered", "2026-09-11", "2026-09-13", "2026-09-12"),
];

const returns: ReturnRequest[] = [
  { id: "RET-201", shipmentId: "SHP-1001", customerId: "brand-1", productSku: "TF-BOX-010", country: "ES", reason: "Producto danado", status: "pending", requestedAt: new Date("2026-09-15") },
  { id: "RET-202", shipmentId: "SHP-1003", customerId: "brand-2", productSku: "TF-LABEL-040", country: "ES", reason: "Producto incorrecto", status: "approved", requestedAt: new Date("2026-09-15"), decidedAt: new Date("2026-09-16") },
];

const resultTitle = requiredElement<HTMLElement>("resultTitle");
const resultEyebrow = requiredElement<HTMLElement>("resultEyebrow");
const resultCount = requiredElement<HTMLElement>("resultCount");
const resultContent = requiredElement<HTMLElement>("resultContent");

requiredElement<HTMLElement>("inventoryCount").textContent = String(inventory.length);
requiredElement<HTMLElement>("shipmentCount").textContent = String(shipments.length);
requiredElement<HTMLElement>("returnCount").textContent = String(returns.length);

requiredElement<HTMLButtonElement>("filterButton").addEventListener("click", () => {
  const warehouseId = requiredElement<HTMLSelectElement>("warehouseFilter").value;
  const maximumQuantityValue = requiredElement<HTMLInputElement>("maximumQuantity").value;
  const lowStockOnly = requiredElement<HTMLInputElement>("lowStockOnly").checked;
  const matches = filterInventory(inventory, {
    ...(warehouseId ? { warehouseId } : {}),
    ...(maximumQuantityValue ? { maximumQuantity: Number(maximumQuantityValue) } : {}),
    lowStockOnly,
  });

  showInventory(matches, "Filtro aplicado", "Inventario filtrado");
});

requiredElement<HTMLButtonElement>("linearSearchButton").addEventListener("click", () => {
  const sku = getSearchSku();
  const match = linearSearch(inventory, (item) => item.sku === sku);
  showInventory(match ? [match] : [], "Busqueda lineal", `Resultado para ${sku || "SKU vacio"}`);
});

requiredElement<HTMLButtonElement>("binarySearchButton").addEventListener("click", () => {
  const sku = getSearchSku();
  const sortedInventory = sortByCriteria(inventory, [
    { getValue: (item) => item.sku, direction: "ascending" },
  ]);
  const match = binarySearch(sortedInventory, sku, (item) => item.sku, compareStrings);
  showInventory(match ? [match] : [], "Busqueda binaria", `Resultado para ${sku || "SKU vacio"}`);
});

requiredElement<HTMLButtonElement>("sortButton").addEventListener("click", () => {
  const field = requiredElement<HTMLSelectElement>("sortField").value as
    | "shippingCost"
    | "weightKg"
    | "createdAt";
  const direction = requiredElement<HTMLSelectElement>("sortDirection").value as SortDirection;
  const criteria: SortCriterion<Shipment>[] = [
    { getValue: (item) => item[field], direction },
    { getValue: (item) => item.trackingNumber, direction: "ascending" },
  ];

  showShipments(sortByCriteria(shipments, criteria), "Orden aplicado", "Envios ordenados");
});

requiredElement<HTMLButtonElement>("reportButton").addEventListener("click", () => {
  const reportType = requiredElement<HTMLSelectElement>("reportType").value;

  if (reportType === "inventory") {
    showInventoryReport();
  } else {
    showOperationalReport();
  }
});

function inventoryItem(
  id: string,
  sku: string,
  name: string,
  category: string,
  warehouseId: string,
  quantity: number,
  minimumStock: number,
  unitWeightKg: number,
  unitValue: number,
): InventoryItem {
  return { id, sku, name, category, warehouseId, quantity, minimumStock, unitWeightKg, unitValue, updatedAt: new Date("2026-09-19") };
}

function shipment(
  id: string,
  trackingNumber: string,
  warehouseId: string,
  carrierId: string,
  destinationCountry: "ES" | "US",
  weightKg: number,
  shippingCost: number,
  priority: "standard" | "express",
  status: Shipment["status"],
  createdAt: string,
  estimatedDeliveryAt: string,
  deliveredAt?: string,
): Shipment {
  return {
    id, trackingNumber, warehouseId, carrierId, destinationCountry, weightKg,
    shippingCost, priority, status, createdAt: new Date(createdAt),
    estimatedDeliveryAt: new Date(estimatedDeliveryAt),
    ...(deliveredAt ? { deliveredAt: new Date(deliveredAt) } : {}),
  };
}

function getSearchSku(): string {
  return requiredElement<HTMLInputElement>("skuSearch").value.trim().toUpperCase();
}

function showInventory(items: readonly InventoryItem[], eyebrow: string, title: string): void {
  setResultHeader(eyebrow, title, items.length);
  resultContent.innerHTML = createTable(
    ["SKU", "Producto", "Categoria", "Almacen", "Unidades", "Estado"],
    items.map((item) => [
      item.sku,
      item.name,
      item.category,
      warehouseName(item.warehouseId),
      String(item.quantity),
      item.quantity <= item.minimumStock ? "Stock bajo" : "Disponible",
    ]),
  );
  window.lucide?.createIcons();
}

function showShipments(items: readonly Shipment[], eyebrow: string, title: string): void {
  setResultHeader(eyebrow, title, items.length);
  resultContent.innerHTML = createTable(
    ["Tracking", "Transportista", "Destino", "Peso", "Coste", "Estado"],
    items.map((item) => [
      item.trackingNumber,
      item.carrierId.toUpperCase(),
      item.destinationCountry,
      `${item.weightKg.toFixed(1)} kg`,
      formatCurrency(item.shippingCost),
      translateStatus(item.status),
    ]),
  );
  window.lucide?.createIcons();
}

function showInventoryReport(): void {
  const report = createInventoryReport(inventory);
  setResultHeader("Reporte generado", "Estado del inventario", inventory.length);
  resultContent.innerHTML = createMetrics([
    ["Unidades totales", String(report.totalUnits)],
    ["Valor de inventario", formatCurrency(report.totalInventoryValue)],
    ["Promedio por SKU", report.averageUnitsPerItem?.toFixed(1) ?? "N/D"],
    ["Menor stock", report.lowestStockItem?.sku ?? "N/D"],
    ["Mayor stock", report.highestStockItem?.sku ?? "N/D"],
    ["Categorias", String(report.itemCountByCategory.size)],
  ]);
}

function showOperationalReport(): void {
  const report = createOperationalReport(shipments, returns);
  setResultHeader("Reporte generado", "Operacion global", shipments.length);
  resultContent.innerHTML = createMetrics([
    ["Volumen de envios", String(report.shipmentCount)],
    ["Envios entregados", String(report.deliveredShipmentCount)],
    ["Entrega a tiempo", formatPercentage(report.onTimeDeliveryRate)],
    ["Coste total", formatCurrency(report.totalShippingCost)],
    ["Coste promedio", report.averageShippingCost === undefined ? "N/D" : formatCurrency(report.averageShippingCost)],
    ["Tasa de devolucion", formatPercentage(report.returnRate)],
  ]);
}

function setResultHeader(eyebrow: string, title: string, count: number): void {
  resultEyebrow.textContent = eyebrow;
  resultTitle.textContent = title;
  resultCount.textContent = `${count} ${count === 1 ? "resultado" : "resultados"}`;
}

function createTable(headers: readonly string[], rows: readonly string[][]): string {
  if (rows.length === 0) {
    return '<div class="flex min-h-56 flex-col items-center justify-center p-8 text-center"><i data-lucide="search-x" class="h-8 w-8 text-slate-400"></i><p class="mt-3 font-bold">Sin resultados</p><p class="mt-1 text-sm text-slate-500">No hay datos que coincidan con los criterios.</p></div>';
  }

  const heading = headers.map((header) => `<th class="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">${escapeHtml(header)}</th>`).join("");
  const body = rows.map((row) => `<tr class="border-t border-slate-100">${row.map((cell) => `<td class="whitespace-nowrap px-5 py-4 text-sm text-slate-700">${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  return `<div class="overflow-x-auto"><table class="w-full"><thead class="bg-slate-50"><tr>${heading}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function createMetrics(metrics: readonly (readonly [string, string])[]): string {
  return `<dl class="grid sm:grid-cols-2 xl:grid-cols-3">${metrics.map(([label, value]) => `<div class="border-b border-slate-200 p-6 sm:border-r"><dt class="text-sm font-semibold text-slate-500">${escapeHtml(label)}</dt><dd class="mt-2 text-3xl font-extrabold text-slate-950">${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
}

function warehouseName(warehouseId: string): string {
  return warehouseId === "warehouse-zgz" ? "Zaragoza" : "Los Angeles";
}

function translateStatus(status: Shipment["status"]): string {
  const labels: Record<Shipment["status"], string> = {
    pending: "Pendiente",
    in_transit: "En transito",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return labels[status];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

function formatPercentage(value: number | undefined): string {
  return value === undefined ? "N/D" : new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
}

function requiredElement<ElementType extends HTMLElement>(id: string): ElementType {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No se encontro el elemento #${id}`);
  return element as ElementType;
}

showInventory(inventory, "Vista inicial", "Inventario consolidado");
window.lucide?.createIcons();