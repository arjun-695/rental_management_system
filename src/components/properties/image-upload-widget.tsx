"use client";

import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, X, LayoutGrid } from "lucide-react";
import Image from "next/image";

interface ImageUploadWidgetProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export default function ImageUploadWidget({
  value,
  onChange,
  maxFiles = 5,
}: ImageUploadWidgetProps) {
  const handleUpload = (result: any) => {
    if (result.event === "success") {
      const secureUrl = result.info.secure_url;
      onChange([...value, secureUrl]);
    }
  };

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <CldUploadWidget
        uploadPreset="rentmanagement" // Optional unsigned preset if needed, or configured through signing
        signatureEndpoint="/api/cloudinary/sign"
        options={{
          multiple: true,
          maxFiles,
          clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
        }}
        onSuccess={handleUpload}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            className="group flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-500/30 bg-background/50 py-10 transition-all hover:border-indigo-400 hover:bg-indigo-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-background"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 transition-transform group-hover:scale-110">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="font-medium text-foreground">Click to upload photos</p>
            <p className="text-xs text-muted-foreground">
              {maxFiles} images max (PNG, JPG, WEBP)
            </p>
          </button>
        )}
      </CldUploadWidget>

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <LayoutGrid className="h-4 w-4" />
              Uploaded Photos ({value.length}/{maxFiles})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {value.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-background/50 shadow-sm"
              >
                <Image
                  src={url}
                  alt="Property Upload"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-2 text-right opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur-sm transition-colors hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
