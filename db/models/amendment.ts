// db/models/amendment.ts
import { getConnection } from "../connection.ts";

export type Amendment = {
  amendment_id: number;
  mou_id: number;
  amendment_no: number;
  description: string | null;
  effective_date: Date | null;
  file_url: string | null;
};

export async function getAmendmentsByMOU(mouId: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<
      Amendment
    >`SELECT * FROM amendments WHERE mou_id = ${mouId} ORDER BY amendment_no`;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function createAmendment(a: Omit<Amendment, "amendment_id">) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<
      { amendment_id: number }
    >`INSERT INTO amendments (mou_id, amendment_no, description, effective_date, file_url) VALUES (${a.mou_id}, ${a.amendment_no}, ${a.description}, ${a.effective_date}, ${a.file_url}) RETURNING amendment_id`;
    return result.rows[0].amendment_id;
  } finally {
    conn.release();
  }
}
