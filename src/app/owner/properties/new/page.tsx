"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { JSX } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Home,
  ImagePlus,
  Info,
  MapPin,
} from "lucide-react";

import AnimatedBackground from "@/components/landing/animated-background";
import ImageUploadWidget from "@/components/properties/image-upload-widget";

type CreatePropertyResponse =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string };

type UploadImageResponse =
  | {
      ok: true;
      data: { imageUrl: string; imagePublicId: string };
    }
  | { ok: false; error: string };

export default function NewPropertyPage(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function onSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setIsSubmitting(true);

    try {
      // Validate images are uploaded
      if (!imageUrls || imageUrls.length === 0) {
        setMessage("Please upload at least one property image");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData(event.currentTarget);
      const payload = {
        title: String(formData.get("title") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        city: String(formData.get("city") ?? "").trim(),
        state: String(formData.get("state") ?? "").trim(),
        country: String(formData.get("country") ?? "India"),
        addressLine1: String(formData.get("addressLine1") ?? "").trim(),
        addressLine2: String(formData.get("addressLine2") ?? ""),
        postalCode: String(formData.get("postalCode") ?? "").trim(),
        type: String(formData.get("type") ?? ""),
        bedrooms: Number(formData.get("bedrooms") ?? 0),
        bathrooms: Number(formData.get("bathrooms") ?? 0),
        areaSqft: formData.get("areaSqft")
          ? Number(formData.get("areaSqft"))
          : undefined,
        monthlyRent: Number(formData.get("monthlyRent") ?? 0),
        securityDeposit: formData.get("securityDeposit")
          ? Number(formData.get("securityDeposit"))
          : undefined,
        availableFrom: String(formData.get("availableFrom") ?? ""),
        imageUrls: imageUrls,
      };

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let body: CreatePropertyResponse;

      try {
        body = (await response.json()) as CreatePropertyResponse;
      } catch (jsonError) {
        // If JSON parsing fails, it's a server error
        console.error("Failed to parse response:", jsonError);
        setMessage(
          `Server error: Response was not valid JSON. Status: ${response.status}`,
        );
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        setMessage(
          `Error: ${body.ok ? "Failed to create property" : body.error || "Unknown error"}`,
        );
        setIsSubmitting(false);
        return;
      }

      if (!body.ok) {
        setMessage(body.error || "Failed to create property");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setMessage(
        `Property created successfully! Reference ID: ${body.data.id}`,
      );
      setImageUrls([]);
      event.currentTarget.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen dark py-8">
      <AnimatedBackground />
      <div className="z-10 mx-auto w-full max-w-3xl px-6 animate-fade-in-up">
        <Link
          href="/owner"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <header className="mb-6 border-b border-border/50 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Add New Property
          </h1>
          <p className="text-muted-foreground mt-1">
            List a new property for prospective tenants to discover.
          </p>
        </header>

        {message && (
          <div
            className={`mb-6 rounded-xl p-4 flex items-start gap-3 border ${
              isSuccess
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
            ) : (
              <Info className="h-5 w-5 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-medium">{isSuccess ? "Success" : "Error"}</p>
              <p className="text-sm opacity-90">{message}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="glass-card flex flex-col gap-8 rounded-2xl p-8 shadow-xl shadow-emerald-500/5 border-emerald-500/10"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <ImagePlus className="h-5 w-5 text-emerald-400" /> Property Photos
            </h3>
            <ImageUploadWidget
              value={imageUrls}
              onChange={setImageUrls}
              maxFiles={10}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-emerald-400" /> Basic
              Information
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                Title
              </label>
              <input
                name="title"
                placeholder="E.g. Cozy 2BHK in South Mumbai"
                className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe the key features, amenities, and nearby locations..."
                className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground border-t border-border/50 pt-6">
              <MapPin className="h-5 w-5 text-emerald-400" /> Location Details
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                Address Line 1
              </label>
              <input
                name="addressLine1"
                placeholder="Street Name, Building"
                className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  City
                </label>
                <input
                  name="city"
                  placeholder="Mumbai"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  State
                </label>
                <input
                  name="state"
                  placeholder="Maharashtra"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  Postal Code
                </label>
                <input
                  name="postalCode"
                  placeholder="400001"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  Country
                </label>
                <input
                  name="country"
                  placeholder="Country"
                  defaultValue="India"
                  className="w-full text-muted-foreground cursor-not-allowed rounded-xl border border-border/50 bg-background/30 py-2.5 px-4 text-sm outline-none"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground border-t border-border/50 pt-6">
              <Home className="h-5 w-5 text-emerald-400" /> Property Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  Property Type
                </label>
                <select
                  name="type"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="STUDIO">Studio</option>
                  <option value="VILLA">Villa</option>
                  <option value="PG">PG</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  Available From
                </label>
                <input
                  name="availableFrom"
                  type="date"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  Bedrooms
                </label>
                <input
                  name="bedrooms"
                  type="number"
                  min={0}
                  placeholder="2"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  Bathrooms
                </label>
                <input
                  name="bathrooms"
                  type="number"
                  min={1}
                  placeholder="2"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-1 pt-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                Monthly Rent (Rs)
              </label>
              <input
                name="monthlyRent"
                type="number"
                min={1}
                placeholder="25000"
                className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Publishing Listing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
