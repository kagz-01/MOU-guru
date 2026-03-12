// db/models/signatory.ts
import { getConnection } from "../connection.ts";

export type Signatory = {
  signatory_id: number;
  mou_id: number;
  party_id: number | null;
  contact_id: number | null;
  name: string | null;
  title: string | null;
  signed_on: Date | null;
  signature_file_url: string | null;
};

export async function getSignatoriesByMOU(mouId: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<
      Signatory
    >`SELECT * FROM signatories WHERE mou_id = ${mouId}`;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function createSignatory(s: Omit<Signatory, "signatory_id">) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<
      { signatory_id: number }
    >`INSERT INTO signatories (mou_id, party_id, contact_id, name, title, signed_on, signature_file_url) VALUES (${s.mou_id}, ${s.party_id}, ${s.contact_id}, ${s.name}, ${s.title}, ${s.signed_on}, ${s.signature_file_url}) RETURNING signatory_id`;
    return result.rows[0].signatory_id;
  } finally {
    conn.release();
  }
}
