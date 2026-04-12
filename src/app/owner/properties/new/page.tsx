"use client";

import { useState } from "react";

type CreatePropertyResponse =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string };

export default function NewPropertyPage(): any {
  const [message, setMessage] = useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage("");

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

    setMessage(`Property created. ID: ${body.data.id}`);
    event.currentTarget.reset();
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Add New Property</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 rounded border p-4">
        <input name="title" placeholder="Title" className="rounded border p-2" required />
        <textarea name="description" placeholder="Description" className="rounded border p-2" required />
        <input name="city" placeholder="City" className="rounded border p-2" required />
        <input name="state" placeholder="State" className="rounded border p-2" required />
        <input name="country" placeholder="Country" defaultValue="India" className="rounded border p-2" required />
        <input name="addressLine1" placeholder="Address line 1" className="rounded border p-2" required />
        <input name="postalCode" placeholder="Postal code" className="rounded border p-2" required />
        <select name="type" className="rounded border p-2" required>
          <option value="APARTMENT">Apartment</option>
          <option value="HOUSE">House</option>
          <option value="STUDIO">Studio</option>
          <option value="VILLA">Villa</option>
          <option value="PG">PG</option>
        </select>
        <input name="bedrooms" type="number" min={0} placeholder="Bedrooms" className="rounded border p-2" required />
        <input name="bathrooms" type="number" min={1} placeholder="Bathrooms" className="rounded border p-2" required />
        <input name="monthlyRent" type="number" min={1} placeholder="Monthly rent" className="rounded border p-2" required />
        <input name="availableFrom" type="date" className="rounded border p-2" required />
        <button type="submit" className="rounded bg-black p-2 text-white">Create Property</button>
      </form>

      {message ? <p className="mt-3 text-sm">{message}</p> : null}
    </main>
  );
}
