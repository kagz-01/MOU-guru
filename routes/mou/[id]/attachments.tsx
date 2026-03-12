// routes/mou/[id]/attachments.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { getMOUById } from "../../../db/models/mou.ts";
import { MOU } from "../../../db/models/mou.ts";
import {
  Attachment,
  deleteAttachment,
  getAttachmentsByMOU,
} from "../../../db/models/attachment.ts";
import { getUserById } from "../../../db/models/user.ts";

type AttachmentWithUser = Attachment & {
  uploaded_by_name: string;
};

type PageData = {
  mou: MOU;
  attachments: AttachmentWithUser[];
};

export const handler: Handlers<PageData | null> = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    const mouId = Number(id);

    const mou = await getMOUById(mouId);
    if (!mou) {
      return ctx.renderNotFound();
    }

    const attachments = await getAttachmentsByMOU(mouId);

    // Get uploader names
    const attachmentsWithUser: AttachmentWithUser[] = [];
    for (const attachment of attachments) {
      const user = await getUserById(attachment.uploaded_by);
      attachmentsWithUser.push({
        ...attachment,
        uploaded_by_name: user ? user.full_name : "Unknown",
      });
    }

    return ctx.render({
      mou,
      attachments: attachmentsWithUser,
    });
  },

  async POST(req, ctx) {
    const { id } = ctx.params;
    const form = await req.formData();

    const action = form.get("action")?.toString();

    if (action === "delete") {
      const attachmentId = Number(form.get("attachment_id"));
      await deleteAttachment(attachmentId);
    }

    return new Response("", {
      status: 303,
      headers: { Location: `/mou/${id}/attachments` },
    });
  },
};

export default function MOUAttachments({ data }: PageProps<PageData>) {
  const { mou, attachments } = data;

  return (
    <div>
      <h1>Attachments for: {mou.title}</h1>

      <div class="attachments-container">
        <h2>Current Attachments</h2>
        {attachments.length === 0
          ? <p>No attachments have been uploaded for this MOU yet.</p>
          : (
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Category</th>
                  <th>Version</th>
                  <th>Uploaded By</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attachments.map((attachment) => (
                  <tr key={attachment.attachment_id}>
                    <td>
                      <a href={attachment.storage_url} target="_blank">
                        {attachment.file_name}
                      </a>
                    </td>
                    <td>{attachment.category}</td>
                    <td>{attachment.version}</td>
                    <td>{attachment.uploaded_by_name}</td>
                    <td>{new Date(attachment.uploaded_at).toLocaleString()}</td>
                    <td>
                      <form method="POST" class="inline-form">
                        <input type="hidden" name="action" value="delete" />
                        <input
                          type="hidden"
                          name="attachment_id"
                          value={attachment.attachment_id}
                        />
                        <button type="submit" class="btn small danger">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        <h2>Upload New Attachment</h2>
        <form
          action={`/api/attachments/upload/${mou.mou_id}`}
          method="POST"
          enctype="multipart/form-data"
        >
          <div class="form-group">
            <label for="file">Select File</label>
            <input type="file" id="file" name="file" required />
          </div>

          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" name="category" required>
              <option value="Draft">Draft</option>
              <option value="Signed">Signed</option>
              <option value="Annex">Annex</option>
              <option value="Amendment">Amendment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="version">Version</label>
            <input
              type="number"
              id="version"
              name="version"
              min="1"
              value="1"
              required
            />
          </div>

          <button type="submit" class="btn primary">Upload</button>
        </form>
      </div>

      <div class="action-links">
        <a href={`/mou/${mou.mou_id}`}>Back to MOU</a>
      </div>
    </div>
  );
}
