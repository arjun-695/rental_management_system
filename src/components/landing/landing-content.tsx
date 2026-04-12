"use client";

import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CalendarCheck,
  Search,
  Users,
  CreditCard,
  ArrowRight,
  Star,
  Home,
  KeyRound,
} from "lucide-react";
import AnimatedBackground from "@/components/landing/animated-background";
import ScrollReveal from "@/components/landing/scroll-reveal";

// ─── Data ────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Building2,
    title: "List Properties",
    desc: "Owners can publish apartments, houses, studios, villas & PGs with full address, pricing, and availability details.",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    icon: Search,
    title: "Smart Search",
    desc: "Tenants find their next home with filters for city, rent range, bedrooms, and property type — lightning fast.",
    gradient: "from-violet-500 to-fuchsia-600",
  },
  {
    icon: CalendarCheck,
    title: "Instant Booking",
    desc: "Date-conflict-aware booking engine with automatic pricing. Request a stay, and owners confirm with one click.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    desc: "Tenant, Owner, and Admin roles each get their own dashboard, permissions, and feature set — secured by middleware.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Users,
    title: "Multi-Tenant Admin",
    desc: "Admins oversee every property, booking, and user. Full control panel with cross-role visibility.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: CreditCard,
    title: "Transparent Pricing",
    desc: "Per-night pricing derived from monthly rent. Security deposits, total amounts, and stay duration — all calculated automatically.",
    gradient: "from-rose-500 to-pink-600",
  },
];

const STATS = [
  { value: "10K+", label: "Properties" },
  { value: "50K+", label: "Happy Tenants" },
  { value: "3K+", label: "Verified Owners" },
  { value: "99.9%", label: "Uptime" },
];

// ─── Component ───────────────────────────────────────────────
export default function LandingContent() {
  return (
    <>
      <AnimatedBackground />

      {/* ───── Hero ───── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px] animate-float-medium" />

        <div className="perspective-container mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 text-center">
          {/* Badge */}
          <div className="animate-fade-in-scale rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-medium tracking-wide text-indigo-400">
            ✨ India&apos;s smartest rental platform
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Find Your{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
              Perfect Home
            </span>
            <br />
            Effortlessly
          </h1>

          {/* Sub-headline */}
          <p
            className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
            style={{ animation: "fade-in-up 0.8s ease-out 0.2s forwards", opacity: 0 }}
          >
            Whether you&apos;re a tenant searching for your next stay, or an owner listing your
            property — RentEase connects you with the right people, instantly.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center justify-center gap-4"
            style={{ animation: "fade-in-up 0.8s ease-out 0.4s forwards", opacity: 0 }}
          >
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.04] hover:shadow-indigo-500/50"
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/properties"
              className="rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-base font-semibold backdrop-blur-sm transition-all duration-300 hover:border-indigo-400/40 hover:bg-indigo-500/10"
            >
              Browse Listings
            </Link>
          </div>

          {/* 3D-floating property card preview */}
          <div
            className="preserve-3d relative mt-8 w-full max-w-3xl"
            style={{ animation: "fade-in-up 0.8s ease-out 0.6s forwards", opacity: 0 }}
          >
            <div className="animate-float-slow glass-card rounded-2xl p-6 shadow-2xl shadow-indigo-500/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Featured listing</p>
                    <p className="text-lg font-bold">Skyline Residency, 3 BHK</p>
                    <p className="text-sm text-muted-foreground">Mumbai, Maharashtra</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-extrabold text-indigo-500">₹32,000</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["3 Bedrooms", "2 Bathrooms", "1450 sqft", "Available Now"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs font-medium text-indigo-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating accent shapes behind the card */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-sm animate-float-fast" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 blur-sm animate-float-medium" />
          </div>
        </div>
      </section>

      {/* ───── Stats bar ───── */}
      <section className="relative py-16">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal>
            <div className="glass-card grid grid-cols-2 gap-6 rounded-2xl px-8 py-10 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal className="mb-16 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
              Everything you need
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              One platform,{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                endless possibilities
              </span>
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.08}>
                <div className="group glass-card relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/10 animate-pulse-glow h-full">
                  {/* Gradient top accent */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal className="mb-16 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
              Simple steps
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Rent in{" "}
              <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                three easy steps
              </span>
            </h2>
          </ScrollReveal>

          <div className="grid gap-10 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up as a Tenant or Owner in seconds. No hidden fees, ever.",
                gradient: "from-indigo-600 to-violet-600",
              },
              {
                step: "02",
                title: "Explore or List",
                desc: "Tenants browse and filter. Owners publish detailed listings with pricing.",
                gradient: "from-violet-600 to-fuchsia-600",
              },
              {
                step: "03",
                title: "Book & Move In",
                desc: "Select dates, confirm the booking, and move into your new home. Simple.",
                gradient: "from-fuchsia-600 to-rose-600",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.12}>
                <div className="relative text-center">
                  <span
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-xl font-black text-white shadow-lg`}
                  >
                    {item.step}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Social proof ───── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollReveal className="mb-16 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
              Loved by renters
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
              What people{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                are saying
              </span>
            </h2>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                name: "Priya Sharma",
                role: "Tenant",
                text: "Found my dream apartment in under 10 minutes. The booking flow is incredibly smooth!",
              },
              {
                name: "Rahul Verma",
                role: "Owner",
                text: "Listed 5 properties and started getting inquiries the same day. The admin panel is powerful yet simple.",
              },
              {
                name: "Ananya Patel",
                role: "Tenant",
                text: "Transparent pricing, no brokerage, and instant conflict-free scheduling. This is the future.",
              },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.1}>
                <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]">
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="relative py-28">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[500px] rounded-full bg-indigo-500/8 blur-[100px]" />
        </div>
        <ScrollReveal className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Ready to find your{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              next home
            </span>
            ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join thousands of tenants and owners already using RentEase. Create your free
            account and start exploring today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.04] hover:shadow-indigo-500/50"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/sign-in"
              className="rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-base font-semibold backdrop-blur-sm transition-all duration-300 hover:border-indigo-400/40 hover:bg-indigo-500/10"
            >
              Sign In
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Home className="h-4 w-4 text-indigo-500" />
            RentEase
          </div>
          <p>&copy; {new Date().getFullYear()} RentEase. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/properties" className="hover:text-foreground transition-colors">
              Properties
            </Link>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
