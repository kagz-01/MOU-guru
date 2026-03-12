// db/models/mou.ts
import { getConnection } from "../connection.ts";

export type MOU = {
  mou_id: number;
  reference_no: string;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  status:
    | "Draft"
    | "Pending Approval"
    | "Active"
    | "Expired"
    | "Terminated"
    | "Renewed";
  governing_law: string;
  confidentiality: boolean;
  ip_terms: string;
  renewal_terms: string;
  termination_clause: string;
  owning_department_id: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
};

export async function getAllMOUs() {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<MOU>`
      SELECT * FROM mous ORDER BY created_at DESC
    `;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function getMOUById(id: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<MOU>`
      SELECT * FROM mous WHERE mou_id = ${id}
    `;
    return result.rows[0];
  } finally {
    conn.release();
  }
}

export async function createMOU(
  mou: Omit<MOU, "mou_id" | "created_at" | "updated_at">,
) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<{ mou_id: number }>`
      INSERT INTO mous (
        reference_no, title, description, start_date, end_date, 
        status, governing_law, confidentiality, ip_terms, 
        renewal_terms, termination_clause, owning_department_id, created_by
      ) VALUES (
        ${mou.reference_no}, ${mou.title}, ${mou.description}, ${mou.start_date}, ${mou.end_date},
        ${mou.status}, ${mou.governing_law}, ${mou.confidentiality}, ${mou.ip_terms},
        ${mou.renewal_terms}, ${mou.termination_clause}, ${mou.owning_department_id}, ${mou.created_by}
      ) RETURNING mou_id
    `;
    return result.rows[0].mou_id;
  } finally {
    conn.release();
  }
}

export async function updateMOU(
  id: number,
  mou: Partial<Omit<MOU, "mou_id" | "created_at" | "updated_at">>,
) {
  const conn = await getConnection();
  try {
    // Build dynamic update query
    const entries = Object.entries(mou).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) return false;

    const setClause = entries.map(([k], i) => `${k} = $${i + 2}`).join(", ");
    const values = entries.map(([_, v]) => v);

    const query = `UPDATE mous SET ${setClause} WHERE mou_id = $1`;
    await conn.queryObject(query, [id, ...values]);
    return true;
  } finally {
    conn.release();
  }
}
