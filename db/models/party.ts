// db/models/party.ts
import { getConnection } from "../connection.ts";

export type Party = {
  party_id: number;
  name: string;
  address: string | null;
  type: string | null;
};

export async function getAllParties() {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<Party>`
      SELECT * FROM parties ORDER BY name
    `;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function getPartyById(id: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<Party>`
      SELECT * FROM parties WHERE party_id = ${id}
    `;
    return result.rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function createParty(party: Omit<Party, "party_id">) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<{ party_id: number }>`
      INSERT INTO parties (name, address, type) 
      VALUES (${party.name}, ${party.address}, ${party.type})
      RETURNING party_id
    `;
    return result.rows[0].party_id;
  } finally {
    conn.release();
  }
}

export async function updateParty(
  id: number,
  party: Partial<Omit<Party, "party_id">>,
) {
  const conn = await getConnection();
  try {
    const entries = Object.entries(party).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) return false;

    const setClause = entries.map(([k], i) => `${k} = $${i + 2}`).join(", ");
    const values = entries.map(([_, v]) => v);

    const query = `UPDATE parties SET ${setClause} WHERE party_id = $1`;
    await conn.queryObject(query, [id, ...values]);
    return true;
  } finally {
    conn.release();
  }
}
