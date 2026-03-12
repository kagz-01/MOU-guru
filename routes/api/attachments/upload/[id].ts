// routes/api/attachments/upload/[id].ts
import { Handlers } from "$fresh/server.ts";
import { createAttachment } from "../../../../db/models/attachment.ts";
import { forbidGuestWrites } from "../../../../utils/guards.ts";

// Function to save uploaded file to disk
async function saveFile(file: File, _userId: number): Promise<string> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = "./static/uploads";
  try {
    await Deno.mkdir(uploadsDir, { recursive: true });
  } catch (_e) {
    // Directory already exists
  }

  // Generate a unique filename
  const timestamp = new Date().getTime();
  const fileName = `${timestamp}-${file.name}`;
  const filePath = `${uploadsDir}/${fileName}`;

  // Save file to disk
  const bytes = await file.arrayBuffer();
  await Deno.writeFile(filePath, new Uint8Array(bytes));

  // Return the public URL
  return `/static/uploads/${fileName}`;
}

type UserState = {
  user?: {
    id: number;
    // add other user properties if needed
  };
};

export const handler: Handlers<unknown, UserState> = {
  async POST(req, ctx) {
    // defense-in-depth: ensure guests/unauthenticated users can't upload
    const blocked = forbidGuestWrites(req, ctx.state.user ?? null);
    if (blocked) return blocked;
    const { id } = ctx.params;
    const mouId = Number(id);

    // Get the current user ID from state
    const userId = ctx.state.user?.id;
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return new Response("No file uploaded", { status: 400 });
      }

      const category = formData.get("category")?.toString() as
        | "Draft"
        | "Signed"
        | "Annex"
        | "Amendment"
        | "Other";
      const version = Number(formData.get("version")) || 1;

      // Save the file
      const fileUrl = await saveFile(file, userId);

      // Create attachment record in database
      await createAttachment({
        mou_id: mouId,
        category,
        file_name: file.name,
        storage_url: fileUrl,
        version,
        uploaded_by: userId,
      });

      return new Response("", {
        status: 303,
        headers: { Location: `/mou/${mouId}/attachments` },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return new Response("Error uploading file", { status: 500 });
    }
  },
};
