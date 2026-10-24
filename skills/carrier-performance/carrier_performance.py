#!/usr/bin/env python3
"""
carrier_performance.py — TrackFlow Carrier Performance Analysis Skill

Analiza el rendimiento histórico de los transportistas de TrackFlow a partir
de un CSV de envíos y genera:
  - carrier_performance_report.json (informe estructurado)
  - carrier_performance_summary.csv (tabla resumen)
  - worst_routes.csv (rutas problemáticas)

Uso:
    python carrier_performance.py --input shipments.csv --output ./output/

Referencia: skills/carrier-performance/SKILL.md
"""

import argparse
import csv
import json
import os
import sys
from collections import defaultdict
from datetime import datetime

import pandas as pd

# Columnas obligatorias según SKILL.md
REQUIRED_COLUMNS = [
    "shipment_id", "carrier", "country", "origin_warehouse",
    "destination_city", "destination_region", "weight_kg",
    "shipping_date", "delivery_status"
]

OPTIONAL_COLUMNS = [
    "delivery_date", "cost_eur", "incident_type", "client_id"
]

ALL_COLUMNS = REQUIRED_COLUMNS + OPTIONAL_COLUMNS

CARRIER_ALIASES = {
    "fed ex": "FedEx", "fedex": "FedEx",
    "ups": "UPS",
    "dhl": "DHL",
    "mrw": "MRW",
    "seur": "SEUR",
}


def parse_args():
    parser = argparse.ArgumentParser(
        description="TrackFlow — Carrier Performance Analysis"
    )
    parser.add_argument("--input", "-i", required=True,
                        help="Ruta al archivo CSV de entrada con datos de envíos")
    parser.add_argument("--output", "-o", default="./output",
                        help="Directorio de salida para los informes (default: ./output)")
    return parser.parse_args()


def validate_columns(df: pd.DataFrame) -> list[str]:
    """Valida que existan todas las columnas obligatorias. Devuelve lista de errores."""
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        return [f"Columna obligatoria faltante: {col}" for col in missing]
    return []


def normalize_carrier(name: str) -> str:
    """Estandariza nombres de carriers."""
    cleaned = name.strip().lower()
    return CARRIER_ALIASES.get(cleaned, name.strip())


def calculate_metrics(group: pd.DataFrame) -> dict:
    """Calcula métricas de rendimiento para un grupo de envíos."""
    total = len(group)
    delivered = group[group["delivery_status"] == "delivered"]
    total_delivered = len(delivered)

    # On-time delivery: delivered and delivery_date - shipping_date <= 5 days
    if total_delivered > 0 and "delivery_date" in group.columns:
        delivered_with_dates = delivered.dropna(subset=["delivery_date"])
        if len(delivered_with_dates) > 0:
            delivery_days = (
                pd.to_datetime(delivered_with_dates["delivery_date"]) -
                pd.to_datetime(delivered_with_dates["shipping_date"])
            ).dt.days
            on_time = (delivery_days <= 5).sum()
            on_time_rate = round((on_time / len(delivered_with_dates)) * 100, 1)
            avg_days = round(delivery_days.mean(), 1)
        else:
            on_time_rate = 0.0
            avg_days = None
    else:
        on_time_rate = 0.0
        avg_days = None

    # Incident rate
    if "incident_type" in group.columns:
        incidents = group[group["incident_type"].notna() & (group["incident_type"] != "none")]
        incident_rate = round((len(incidents) / total) * 100, 1) if total > 0 else 0.0
        # Top incident type
        if len(incidents) > 0:
            top_incident = incidents["incident_type"].mode().iloc[0]
        else:
            top_incident = None
    else:
        incident_rate = 0.0
        top_incident = None

    # Average cost per kg
    if "cost_eur" in group.columns:
        cost_data = group.dropna(subset=["cost_eur", "weight_kg"])
        if len(cost_data) > 0:
            avg_cost_per_kg = round((cost_data["cost_eur"] / cost_data["weight_kg"]).mean(), 2)
        else:
            avg_cost_per_kg = None
    else:
        avg_cost_per_kg = None

    # Lost rate
    lost = group[group["delivery_status"] == "lost"]
    lost_rate = round((len(lost) / total) * 100, 2) if total > 0 else 0.0

    return {
        "total_shipments": total,
        "on_time_delivery_rate": on_time_rate,
        "avg_delivery_days": avg_days,
        "incident_rate": incident_rate,
        "avg_cost_per_kg": avg_cost_per_kg,
        "lost_rate": lost_rate,
        "top_incident_type": top_incident,
    }


def assess_data_quality(df: pd.DataFrame) -> list[str]:
    """Identifica campos con más del 1% de valores nulos."""
    notes = []
    total = len(df)
    for col in ALL_COLUMNS:
        if col in df.columns:
            null_count = df[col].isna().sum()
            pct = (null_count / total) * 100
            if pct > 1:
                notes.append(
                    f"{col} tiene {null_count} valores nulos ({pct:.1f}% del total)"
                )
    return notes


def main():
    args = parse_args()
    input_path = args.input
    output_dir = args.output

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    print(f"📥 Cargando datos desde: {input_path}")
    try:
        df = pd.read_csv(input_path)
    except FileNotFoundError:
        print(f"❌ Error: Archivo no encontrado: {input_path}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error al leer el archivo CSV: {e}")
        sys.exit(1)

    print(f"   Filas cargadas: {len(df)}")
    print(f"   Columnas: {list(df.columns)}")

    # Step 1: Validate columns
    errors = validate_columns(df)
    if errors:
        print("❌ Validación de columnas fallida:")
        for err in errors:
            print(f"   - {err}")
        sys.exit(1)
    print("✅ Columnas obligatorias presentes")

    # Step 2: Cleanse
    print("🧹 Limpiando datos...")
    # Standardize carrier names
    df["carrier"] = df["carrier"].astype(str).apply(normalize_carrier)
    # Remove duplicate shipment_ids (keep first)
    before_dedup = len(df)
    df = df.drop_duplicates(subset=["shipment_id"], keep="first")
    dupes_removed = before_dedup - len(df)
    if dupes_removed > 0:
        print(f"   Duplicados eliminados: {dupes_removed}")
    # Normalize country codes
    country_map = {"usa": "US", "united states": "US", "ee.uu.": "US",
                   "spain": "ES", "españa": "ES"}
    df["country"] = df["country"].astype(str).str.strip().str.lower().map(
        lambda x: country_map.get(x, x.upper()) if isinstance(x, str) else x
    )

    # Step 3 & 4: Calculate metrics
    print("📊 Calculando métricas por transportista...")
    carriers = df["carrier"].unique()
    carrier_summary = []
    for carrier in carriers:
        carrier_data = df[df["carrier"] == carrier]
        metrics = calculate_metrics(carrier_data)
        metrics["carrier"] = carrier
        metrics["country"] = carrier_data["country"].mode().iloc[0] if len(carrier_data) > 0 else "unknown"
        carrier_summary.append(metrics)

    # Route performance
    print("🗺️  Calculando métricas por ruta...")
    route_groups = df.groupby(["carrier", "destination_region"])
    route_performance = []
    for (carrier, region), group in route_groups:
        metrics = calculate_metrics(group)
        metrics["carrier"] = carrier
        metrics["destination_region"] = region
        route_performance.append(metrics)

    # Worst routes (top 10 by incident_rate)
    route_df = pd.DataFrame(route_performance)
    if len(route_df) > 0 and "incident_rate" in route_df.columns:
        worst_routes = route_df.nlargest(10, "incident_rate")
    else:
        worst_routes = pd.DataFrame()

    # Generate recommendations for worst routes
    worst_routes_list = []
    for _, row in worst_routes.iterrows():
        recommendation = (
            f"Evaluar carrier alternativo para la ruta {row['carrier']} → {row['destination_region']}: "
            f"tasa de incidencias del {row['incident_rate']}%"
        )
        worst_routes_list.append({
            "carrier": row["carrier"],
            "region": row["destination_region"],
            "incident_rate": row["incident_rate"],
            "recommendation": recommendation,
        })

    # Step 5: Data quality
    print("🔍 Evaluando calidad de datos...")
    data_notes = assess_data_quality(df)

    # Build report
    report = {
        "report_metadata": {
            "generated_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "total_shipments_analyzed": len(df),
            "carriers_analyzed": len(carriers),
            "carriers_list": sorted(carriers.tolist()),
        },
        "carrier_summary": sorted(carrier_summary, key=lambda x: x["total_shipments"], reverse=True),
        "route_performance": sorted(route_performance, key=lambda x: x["incident_rate"], reverse=True),
        "worst_routes": worst_routes_list,
        "data_quality_notes": data_notes,
    }

    # Save outputs
    json_path = os.path.join(output_dir, "carrier_performance_report.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"✅ Informe JSON guardado: {json_path}")

    # CSV summary
    summary_csv_path = os.path.join(output_dir, "carrier_performance_summary.csv")
    summary_df = pd.DataFrame(carrier_summary)
    summary_df.to_csv(summary_csv_path, index=False, quoting=csv.QUOTE_NONNUMERIC)
    print(f"✅ Resumen CSV guardado: {summary_csv_path}")

    # Worst routes CSV
    if worst_routes_list:
        worst_csv_path = os.path.join(output_dir, "worst_routes.csv")
        worst_df = pd.DataFrame(worst_routes_list)
        worst_df.to_csv(worst_csv_path, index=False, quoting=csv.QUOTE_NONNUMERIC)
        print(f"✅ Rutas problemáticas CSV guardado: {worst_csv_path}")
    else:
        print("⚠️  No se identificaron rutas problemáticas (sin datos de incidencias)")

    print("\n📋 Resumen del análisis:")
    print(f"   Transportistas analizados: {len(carriers)}")
    print(f"   Total envíos procesados: {len(df)}")
    print(f"   Notas de calidad de datos: {len(data_notes)}")
    print("✅ Análisis completado exitosamente.")


if __name__ == "__main__":
    main()