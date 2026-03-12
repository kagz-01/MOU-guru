// db/models/mou_parties.ts
import { getConnection } from "../connection.ts";

export type MOU_Party = {
  mou_id: number;
  party_id: number;
  role: string;
};

export type MOUPartyDetail = {
  mou_id: number;
  party_id: number;
  role: string;
  name: string;
  address: string | null;
  type: string | null;
};

export async function getPartiesByMOU(mouId: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<MOUPartyDetail>`
      SELECT mp.mou_id, mp.party_id, mp.role, p.name, p.address, p.type 
      FROM mou_parties mp
      JOIN parties p ON mp.party_id = p.party_id
      WHERE mp.mou_id = ${mouId}
      ORDER BY p.name ASC
    `;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function addPartyToMOU(
  mouId: number,
  partyId: number,
  role: string,
) {
  const conn = await getConnection();
  try {
    await conn
      .queryObject`INSERT INTO mou_parties (mou_id, party_id, role) VALUES (${mouId}, ${partyId}, ${role})`;
    return true;
  } finally {
    conn.release();
  }
}

export async function removePartyFromMOU(mouId: number, partyId: number) {
  const conn = await getConnection();
  try {
    await conn
      .queryObject`DELETE FROM mou_parties WHERE mou_id = ${mouId} AND party_id = ${partyId}`;
    return true;
  } finally {
    conn.release();
  }
}
