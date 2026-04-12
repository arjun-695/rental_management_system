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
  UploadCloud,
} from "lucide-react";

import AnimatedBackground from "@/components/landing/animated-background";

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{
    imageUrl: string;
    imagePublicId: string;
  } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  async function uploadSelectedImage(file: File): Promise<{
    imageUrl: string;
    imagePublicId: string;
  } | null> {
    setIsUploadingImage(true);

    try {
      const body = new FormData();
      body.append("image", file);

      const response = await fetch("/api/uploads/property-image", {
        method: "POST",
        body,
      });

      const payload = (await response.json()) as UploadImageResponse;

      if (!response.ok || !payload.ok) {
        setMessage(payload.ok ? "Image upload failed." : payload.error);
        setIsSuccess(false);
        return null;
      }

      return payload.data;
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    let imagePayload = uploadedImage;

    // Upload image first so property stores stable Cloudinary URL/publicId.
    if (selectedImage && !uploadedImage) {
      const uploaded = await uploadSelectedImage(selectedImage);
      if (!uploaded) return;

      imagePayload = uploaded;
      setUploadedImage(uploaded);
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      country: String(formData.get("country") ?? "India"),
      addressLine1: String(formData.get("addressLine1") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      type: String(formData.get("type") ?? ""),
      bedrooms: Number(formData.get("bedrooms") ?? 0),
      bathrooms: Number(formData.get("bathrooms") ?? 0),
      monthlyRent: Number(formData.get("monthlyRent") ?? 0),
      availableFrom: String(formData.get("availableFrom") ?? ""),
      coverImageUrl: imagePayload?.imageUrl,
      coverImagePublicId: imagePayload?.imagePublicId,
    };

    const response = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as CreatePropertyResponse;

    if (!response.ok || !body.ok) {
      setMessage(body.ok ? "Could not create property" : body.error);
      return;
    }

    setIsSuccess(true);
    setMessage(`Property created successfully! Reference ID: ${body.data.id}`);
    setSelectedImage(null);
    setUploadedImage(null);
    event.currentTarget.reset();
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Property</h1>
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
              <ImagePlus className="h-5 w-5 text-emerald-400" /> Property Photo
            </h3>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 px-4 py-4 text-sm text-emerald-300 hover:bg-emerald-500/10">
              <UploadCloud className="h-4 w-4" />
              <span>{selectedImage ? selectedImage.name : "Choose cover image (optional)"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedImage(file);
                  setUploadedImage(null);
                }}
              />
            </label>
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Property preview"
                className="h-52 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-emerald-400" /> Basic Information
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">Title</label>
              <input
                name="title"
                placeholder="E.g. Cozy 2BHK in South Mumbai"
                className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">Description</label>
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
              <label className="text-xs font-medium text-muted-foreground ml-1">Address Line 1</label>
              <input
                name="addressLine1"
                placeholder="Street Name, Building"
                className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">City</label>
                <input
                  name="city"
                  placeholder="Mumbai"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">State</label>
                <input
                  name="state"
                  placeholder="Maharashtra"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">Postal Code</label>
                <input
                  name="postalCode"
                  placeholder="400001"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">Country</label>
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
                <label className="text-xs font-medium text-muted-foreground ml-1">Property Type</label>
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
                <label className="text-xs font-medium text-muted-foreground ml-1">Available From</label>
                <input
                  name="availableFrom"
                  type="date"
                  className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">Bedrooms</label>
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
                <label className="text-xs font-medium text-muted-foreground ml-1">Bathrooms</label>
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
              <label className="text-xs font-medium text-muted-foreground ml-1">Monthly Rent (Rs)</label>
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
              disabled={isUploadingImage}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploadingImage ? "Uploading image..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
