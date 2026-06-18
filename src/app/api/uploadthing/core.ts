import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentDbUser } from "@/lib/current-user";

const f = createUploadthing();

export const ourFileRouter = {
  labResultUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await getCurrentDbUser();
      if (!user) throw new Error("Unauthorized");
      if (!user.profileCompleted) {
        throw new Error("Complete your profile before uploading reports.");
      }
      return { userId: user.clerkId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
