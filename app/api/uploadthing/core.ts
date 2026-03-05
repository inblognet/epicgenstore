// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // 1. Existing route for customer bank slips (Standard User Access)
  bankSlipUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // 2. NEW route for product thumbnails (ADMIN ONLY Access)
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      // Strict check: Only allow users with the ADMIN role
      if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Only admins can upload product images.");
      }
      return { userId: session.user.id, role: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Admin image upload complete for:", metadata.userId);
      console.log("Admin File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;