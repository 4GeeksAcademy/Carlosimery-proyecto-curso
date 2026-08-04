# Welcome to TrackFlow

## AI Engineering · 4Geeks Academy — Company Briefing

---

TrackFlow is a last-mile logistics and warehouse management company founded in 2009 in Los Angeles, United States. It operates in two markets — the United States and Spain — with warehouses in Los Angeles and Zaragoza. The company has around 130 employees and generates roughly 9 million euros in annual revenue.

TrackFlow exists because e-commerce brands are good at making and selling products, but not at getting those products to customers' doors. That is what TrackFlow does for them: it stores inventory, prepares and packs orders, ships them through a carrier network, and manages returns when products come back. For brands that work with TrackFlow, the entire logistics operation — from the moment an order is placed to the moment it is delivered or returned — is TrackFlow's responsibility.

## How the company is organized

TrackFlow is led by **Thomas Harry**, founder and CEO, based in Los Angeles. The company has a technology office in Zaragoza, Spain, where CTO Andres Kim and most of the technical team are located. Operations, sales, and customer support teams are distributed across both countries.

The company is organized into the following areas:

**Warehouse Operations** is where the physical logistics work happens. Ana Whitfield oversees both warehouses — one in Los Angeles, one in Zaragoza — and the roughly 70 operators who run them. Every day, hundreds of orders arrive, are picked from shelves, packed, and handed to carriers. The two warehouses run on different systems and do not share a unified view of inventory.

**Last-Mile and Carrier Management** handles relationships with the 8 carriers TrackFlow uses across both countries — including UPS, FedEx, MRW, and SEUR. Carlos Vega coordinates which carrier handles each shipment, tracks deliveries, and manages the incidents that inevitably occur: lost packages, failed deliveries, and incorrect addresses. Today, most of this is done manually, carrier by carrier.

**Reverse Logistics** manages what happens when a product comes back. Sofia Ramos leads this five-person team. Returns account for between 18% and 25% of total volume depending on client and country, and every return involves a decision chain — approve or reject, pick up or not, refurbish or discard — that currently goes through human review.

**Customer Support** is the front line between TrackFlow and the people it serves. Valentina Cruz manages 15 agents in Los Angeles and Zaragoza who handle inquiries from both brands (who want to know how their operation is doing) and end consumers (who want to know where their package is). Most inquiries are repetitive, and right now each one is answered by a person.

**Sales and Client Relations** manages TrackFlow's brand-client portfolio. Miguel Torres leads account managers and the business development team, responsible for retaining current clients and winning new ones. Contracts are annual, and renewals are won or lost based on whether clients feel their logistics operation is working well.

**Technology** is the team that builds and maintains everything. Andres Kim leads from Zaragoza a team of developers, data engineers, and systems staff. The current architecture is a patchwork: two different warehouse systems, an ERP from the early 2010s, and integrations built quickly and never properly documented. When something fails, the team finds out through a WhatsApp message from someone in operations.

**Executive Leadership** is led by Thomas, who runs the business from Los Angeles using a consolidated weekly report that each director prepares manually — a process that consumes hours every Sunday night and still delivers data that is already one or two days old.

## Where the company stands today

TrackFlow has strong clients, a capable operations team, and a clear value proposition. What it lacks is the infrastructure to run a two-country logistics operation at scale. The two warehouses cannot see each other's inventory. Carrier performance data does not exist in any structured form. Returns are approved or rejected one by one. Customer inquiries are answered by agents checking a Word document in Google Drive. The CEO makes decisions based on a hand-assembled report.

The result is that TrackFlow is slower, more error-prone, and less profitable than it needs to be — and the gap is widening as competitors invest in automation.

Daniel has created an internal unit called **TrackFlow Tech** with a clear mandate: build the systems, integrations, and intelligent automations that allow TrackFlow to operate like the modern logistics company it needs to be.

**You are part of that unit.**

---

## Departments and their problems

### 🚚 Warehouse operations

**Owner:** Ana Whitfield (~70 operators + 2 warehouse leads)

The Los Angeles and Zaragoza warehouses use different warehouse management systems (WMS) — one is commercial software, the other is an advanced spreadsheet. There is no global real-time inventory visibility. Incoming orders arrive by email in different formats depending on the client and are transcribed manually. Picking is done with paper lists. Inventory discrepancies are frequent and detected late.

**What they need:** A unified inventory API that returns real-time stock for any SKU in either warehouse, an order ingestion pipeline that automatically parses emails, a warehouse operations dashboard, and low-stock alerts that notify both the client and the procurement team.

---

### 📦 Last mile and carrier management

**Owner:** Carlos Vega (6 logistics coordinators)

TrackFlow works with 8 carriers across both countries (UPS, FedEx, and DHL in the United States; MRW, SEUR, and DHL in Spain, plus two local carriers). Carrier assignment per shipment is manual. Package tracking requires checking multiple separate carrier portals. There is no historical performance data: no on-time delivery rate, no route-level incidents, no cost per kg.

**What they need:** A carrier selection engine that recommends the optimal option given destination, weight, and urgency; a unified tracking endpoint that aggregates status from any carrier; a public tracking portal for recipients; and a carrier performance dashboard.

---

### 🔄 Reverse logistics

**Owner:** Sofia Ramos (team of 5)

Returns represent between 18% and 25% of volume depending on client and country. Every return goes through manual review — there are no automatic approval criteria. Inspection of returned products is subjective and inconsistent across operators. There is no visibility into which products are returned most and why.

**What they need:** An automatic return approval engine with client-configurable rules, an automated pickup flow (approval -> label -> customer instructions -> carrier scheduling), an AI-assisted inspection system where the operator photographs the product and AI classifies its condition, and a returns dashboard with pattern analysis.

---

### 📞 Customer experience

**Owner:** Valentina Cruz (15 agents in Los Angeles and Zaragoza)

TrackFlow serves two customer types: brands (B2B) that hire its services and end consumers (B2C) who receive packages. The 15 agents handle both through email, WhatsApp, and phone without a unified ticketing system. 80% of inquiries could be resolved automatically. There is no knowledge base. Coverage outside office hours is zero.

**What they need:** A frontline CX agent that automatically resolves tracking and return-status inquiries, a semantically indexed knowledge base for RAG, a unified ticketing system, a real-time CX dashboard, and sentiment analysis to detect frustrated clients before escalation. Multilingual support (Spanish + English) is optional but highly recommended, starting with one base language.

---

### 🤝 Sales and client relations

**Owner:** Miguel Torres (4 account managers + 4 business development)

Account managers run their accounts in personal spreadsheets and email threads — there is no CRM. Client reports are manual: every month an account manager consolidates data from multiple systems to send each client a PDF report. There is no visibility into which clients are at risk of not renewing.

**What they need:** CRM integration with a unified client profile, automatically generated PDF client reports by an agent, a client health dashboard with renewal risk scoring, alerts at 90 and 30 days before contract expiration, and a sales agent that suggests the most relevant service and pricing structure for each prospect.

---

### 💻 Technology

**CTO:** Andres Kim (team of 7 in Zaragoza)

TrackFlow's technology architecture is the result of years of unplanned growth: two different WMS platforms, a corporate ERP from the early 2010s, undocumented point-to-point Python scripts, and databases across two different cloud providers. There is no centralized telemetry. When an endpoint fails in Los Angeles, the Zaragoza team learns via WhatsApp. Deploying a new feature takes one to two weeks.

**What they need:** Centralized telemetry and logging across both countries, a data pipeline that feeds all company dashboards, real-time monitoring with automatic alerts, a technical documentation agent, and automation of operations tasks (backups, health checks, incident notifications with context).

---

### 📊 Executive leadership

**CEO:** Daniel Espinoza

Daniel receives a consolidated report every Monday that directors prepare on Sunday afternoon by combining data from different systems — 3 to 4 hours of work per director. By Monday at 10:00 AM, some data is already two days old. There is no unified business view by country. Strategic decisions are made with partial data.

**What he needs:** A global executive dashboard with real-time KPIs from both operations (shipment volume, on-time delivery rate, operating cost, returns, customer satisfaction), an automatically generated weekly report every Monday at 7:00 AM, country comparisons, threshold alerts, and an AI assistant he can query in natural language.

---

## Why choose TrackFlow?

Choose TrackFlow if you are drawn to:

- **Logistics and physical operations** — every line of code you write is connected to a package moving from a warehouse shelf to someone's door.
- **Cross-border complexity** — two countries, two languages, two regulatory environments, and two separate technology stacks that must be unified.
- **Data engineering in its most concrete form** — carrier performance metrics, SKU-level inventory, shipment event streams, and returns classification are all structured, measurable, and visually impactful in dashboards.
- **Systems that run 24/7** — TrackFlow clients do not stop expecting packages after 6:00 PM. The CX agent, tracking portal, and operations dashboard must always be available.

TrackFlow's AI challenges include classifying returned-product condition from images, semantic search over logistics policies in two languages, intelligent carrier selection with explainable recommendations, and a real-time tracking aggregator that pulls data from 8 different carrier APIs. If you want to build systems that handle real-world physical complexity at scale, TrackFlow is your company.

---

_Internal document — 4Geeks Academy · AI Engineering Track_
_For exclusive use in program project generation_
