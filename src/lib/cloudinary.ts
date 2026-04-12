import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

type UploadedAsset = {
  secureUrl: string;
  publicId: string;
};

let configured = false;

function getCloudinaryConfig(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary environment variables are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function ensureCloudinaryConfigured(): void {
  if (configured) return;

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

export async function uploadPropertyImage(
  file: File,
  ownerId: string,
): Promise<UploadedAsset> {
  ensureCloudinaryConfigured();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<UploadedAsset>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "rentease/properties",
        public_id: `${ownerId}-${Date.now()}`,
        resource_type: "image",
        transformation: [
          { width: 1600, height: 900, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        const uploadResult = result as UploadApiResponse;
        resolve({
          secureUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      },
    );

    stream.end(buffer);
  });
}
