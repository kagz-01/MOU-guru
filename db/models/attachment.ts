// db/models/attachment.ts
import { getConnection } from "../connection.ts";

export type Attachment = {
  attachment_id: number;
  mou_id: number;
  category: "Draft" | "Signed" | "Annex" | "Amendment" | "Other";
  file_name: string;
  storage_url: string;
  version: number;
  uploaded_by: number;
  uploaded_at: Date;
};

export async function getAttachmentsByMOU(mouId: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<Attachment>`
      SELECT * FROM attachments 
      WHERE mou_id = ${mouId}
      ORDER BY category, version DESC, uploaded_at DESC
    `;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function createAttachment(
  attachment: Omit<Attachment, "attachment_id" | "uploaded_at">,
) {
  const conn = await getConnection();
  try {
    // Start transaction-like operation: compute next version and insert
    await conn.queryObject`BEGIN`;
    const res = await conn.queryObject<{ max_version: number | null }>`
      SELECT MAX(version) as max_version FROM attachments WHERE mou_id = ${attachment.mou_id} AND file_name = ${attachment.file_name}
    `;
    const maxV = res.rows[0]?.max_version ?? 0;
    const nextV = maxV + 1;
    const insert = await conn.queryObject<{ attachment_id: number }>`
      INSERT INTO attachments (
        mou_id, category, file_name, storage_url, version, uploaded_by
      ) VALUES (
        ${attachment.mou_id}, ${attachment.category}, ${attachment.file_name}, 
        ${attachment.storage_url}, ${nextV}, ${attachment.uploaded_by}
      ) RETURNING attachment_id
    `;
    await conn.queryObject`COMMIT`;
    return insert.rows[0].attachment_id;
  } catch (e) {
    try {
      await conn.queryObject`ROLLBACK`;
    } catch (_e) {
      // ignore rollback error
    }
    throw e;
  } finally {
    conn.release();
  }
}

export async function deleteAttachment(id: number) {
  const conn = await getConnection();
  try {
    await conn.queryObject`DELETE FROM attachments WHERE attachment_id = ${id}`;
    return true;
  } finally {
    conn.release();
  }
}
