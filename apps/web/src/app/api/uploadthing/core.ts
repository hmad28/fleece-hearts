import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAdminUser } from "@/lib/auth/admin";

const upload = createUploadthing();

export const fileRouter = {
  adminImage: upload({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const admin = await getAdminUser();
      if (!admin) throw new UploadThingError({ code: "FORBIDDEN", message: "Akses admin diperlukan" });
      return { uploadedBy: admin.id };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
