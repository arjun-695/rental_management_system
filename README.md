<div align="center">

<!-- Modern Minimalist Header -->
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NextJS-Dark.svg" height="42" style="margin: 0 8px;"/>
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" height="42" style="margin: 0 8px;"/> 
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" height="42" style="margin: 0 8px;"/>
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Prisma.svg" height="42" style="margin: 0 8px;"/>
<img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/MySQL-Dark.svg" height="42" style="margin: 0 8px;"/>

<br/><br/>

<h1 align="center" style="border-bottom: none; margin-bottom: 0;"><strong>[ RENTAL :: MGT ]</strong></h1>
<p align="center" style="font-family: monospace; color: #8B5CF6; letter-spacing: 0.1em; font-size: 14px;">PROPERTY RENTAL INFRASTRUCTURE</p>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&weight=600&size=20&pause=1000&color=06B6D4&center=true&vCenter=true&width=600&height=40&lines=SYS.RDY%3A+Seamless+Tenant+Onboarding;COORD.X%3A+Dynamic+Property+Filtering;NET.TX%3A+Secure+Razorpay+Checkouts;MEM.VOL%3A+Role-Based+Admin+Dashboards" alt="Typing SVG" />
</a>

<p align="center">
  <em>A high-performance, dark-themed platform for modern property management, powered by decoupled Server Actions and robust payment queues.</em>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-0F172A?style=flat-square&logoColor=white&labelColor=020617&color=3B82F6" />
  <img alt="Frontend" src="https://img.shields.io/badge/UI-Next.js-0F172A?style=flat-square&logo=nextdotjs&logoColor=white&labelColor=020617&color=0F172A" />
  <img alt="Database" src="https://img.shields.io/badge/DB-MariaDB-0F172A?style=flat-square&logo=mariadb&logoColor=009688&labelColor=020617&color=0F172A" />
  <img alt="ORM" src="https://img.shields.io/badge/ORM-Prisma-0F172A?style=flat-square&logo=prisma&logoColor=06B6D4&labelColor=020617&color=0F172A" />
  <img alt="Payments" src="https://img.shields.io/badge/Payments-Razorpay-0F172A?style=flat-square&logoColor=8B5CF6&labelColor=020617&color=0F172A" />
</p>

<p align="center">
  <a href="#-core-architecture"><b>Architecture</b></a> &nbsp;&bull;&nbsp;
  <a href="#-infrastructure-setup"><b>Setup</b></a> &nbsp;&bull;&nbsp;
  <a href="#-feature-matrix"><b>Features</b></a> &nbsp;&bull;&nbsp;
  <a href="#-rbac-personas"><b>Roles</b></a>
</p>

</div>

---

## ⚡ Feature Matrix

Rental Mgt embraces a strictly minimal, tech-forward aesthetic. It removes UX bottlenecks with pure speed, ditching heavy client loads for instantaneous, Server-Side Rendered performance.

| Capability | Module | Description |
| :--- | :--- | :--- |
| **Role-Based RBAC** | `NextAuth` | First-party register/login with secure session tokens, plus global `admin`, `owner`, and `tenant` roles. |
| **Financial Pipeline** | `Razorpay Flow` | Non-blocking financial settlement via fully integrated Razorpay checkout and backend webhook verification. |
| **Property Control** | `Listing Engine` | Imperative approval circuits. Search pipelines ensure 100% localized accuracy by rent, area, and dates. |
| **Booking Matrices** | `Booking System` | Distills requested stay allocations into distinct tracking states, avoiding logical clashing of property dates. |
| **Zero-Latency UI** | `Shadcn Renderer` | Hardware-accelerated UI components via TailwindCSS. Zero-bloat OLED-optimized dark interface. |

<br/>

## 🏗️ Core Architecture

A highly decoupled, full-stack topology. The monolithic Next.js application has been strictly partitioned into localized domains allowing infinite horizontal scaling over Vercel/Node instances.

```mermaid
graph TD
    %% Styling
    classDef client fill:#020617,stroke:#3B82F6,stroke-width:1px,color:#fff
    classDef proxy fill:#0F172A,stroke:#06B6D4,stroke-width:1px,color:#fff
    classDef backend fill:#0F172A,stroke:#8B5CF6,stroke-width:1px,color:#fff
    classDef worker fill:#111827,stroke:#10B981,stroke-width:1px,color:#fff

    Client[💻 Web Client<br/>React / Next.js]:::client
    Edge[🌐 Edge Network<br/>CDN]:::proxy

    NextApp[⚡ App Router<br/>Next.js Server Actions]:::backend
    DB[(🐘 Primary DB<br/>MariaDB)]:::worker
    Auth[🔑 Security Core<br/>NextAuth.js]:::backend
    Pay[[💳 Payment Gateway<br/>Razorpay]]:::backend

    Client -->|HTTP / WSS| Edge
    Edge -->|Proxy| NextApp

    NextApp -->|Prisma TCP| DB
    NextApp -->|Session State| Auth
    NextApp -->|Initialize Orders| Pay
    Pay -->|Webhook Sync| NextApp
```

<br/>

## 🚀 Infrastructure Setup

Bootstrapping the entire constellation of services can be done via Docker (Recommended) or standard Node.js.

> [!IMPORTANT]
> Ensure ports `3000` (Next.js) and `3306` (MariaDB) are open on your host machine.

### Method A: Docker Compose (Recommended)

Requires Docker Desktop or Docker Engine installed.

```bash
# 1. Clone & initialize environment
git clone <repository_url>
cd rental-management-system

# 2. Configure variables
cp .env.example .env
# Important: Docker maps 'database' hostname. No need to change DATABASE_URL from default.
# Add your Razorpay & NextAuth keys to docker-compose.yml or .env

# 3. Boot up the topology and build the image
docker-compose up -d --build
```

### Method B: Standard Implementation

Requires Node.js and a locally running MariaDB/MySQL instance.

```bash
# 1. Clone & install dependencies
git clone <repository_url>
cd rental-management-system
npm install

# 2. Configure variables (requires .env from .env.example)
# Add your Razorpay keys, DB URI, and NextAuth bindings

# 3. Inject initial DB schemas and generated Edge clients
npx prisma db push
npx prisma generate

# 4. Boot up development topology
npm run dev
```

### 📡 Telemetry & Access

| Intranet Target | Port Bind | Responsibility |
| :--- | :--- | :--- |
| **Control Panel UI** | `localhost:3000` | The primary frontend interface. |
| **Prisma Studio** | `localhost:5555` | (npx prisma studio) Database table explorer. |

<br/>

## 👤 RBAC Personas

The database tracks three core permission layers. Production onboarding is completely self-serve through the credentials/OAuth registration endpoints.

| Rank | Capabilities |
| :--- | :--- |
| `[ADMIN]` | Global R/W. System-wide dashboard moderation, user suspension, and global payment insight. |
| `[OWNER]` | Queue isolation. Dashboard for listing management, confirming bookings, and viewing property income. |
| `[TENANT]`| Self-serve property browsing, integrated Razorpay execution, and review generation. |

<br/>

## 🧠 System Development

Located within the `/src/generated` and root configurations, operational scripts maintain schema alignment and code consistency.

```bash
# 1. Update Database topology based on pending migrations
npx prisma migrate dev

# 2. Re-compile TailwindCSS / PostCSS bundles
npm run build

# 3. Analyze Typescript nodes & DOM trees
npm run lint
```
