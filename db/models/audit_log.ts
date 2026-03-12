import { getConnection } from "../connection.ts";
import { encodeHex } from "jsr:@std/encoding/hex";

export type AuditLog = {
  audit_id: number;
  table_name: string;
  record_id: number;
  action: "INSERT" | "UPDATE" | "DELETE" | "FINALIZE";
  changed_at: Date;
  changed_by: number | null;
  diff: Record<string, unknown> | null;
  payload_hash?: string | null;
  previous_hash?: string | null;
};

export async function createAuditLog(
  entry: Omit<AuditLog, "audit_id" | "changed_at">,
) {
  const conn = await getConnection();
  try {
    await conn
      .queryObject`INSERT INTO audit_log (table_name, record_id, action, changed_by, diff, payload_hash, previous_hash) VALUES (${entry.table_name}, ${entry.record_id}, ${entry.action}, ${entry.changed_by}, ${entry.diff}, ${
      entry.payload_hash || null
    }, ${entry.previous_hash || null})`;
    return true;
  } finally {
    conn.release();
  }
}

/**
 * Creates an immutable cryptographic hash of the payload for verification purposes.
 * This represents the "Immutable Audit Trail" feature.
 */
export async function createImmutableAuditHash(
  tableName: string,
  recordId: number,
  userId: number,
  payload: Record<string, unknown>,
): Promise<string> {
  const conn = await getConnection();
  try {
    // 1. Get the previous hash for this record to create a blockchain-like chain
    const prevResult = await conn.queryObject<{ payload_hash: string }>`
      SELECT payload_hash FROM audit_log 
      WHERE table_name = ${tableName} AND record_id = ${recordId} 
      AND payload_hash IS NOT NULL
      ORDER BY changed_at DESC LIMIT 1
    `;
    const previousHash = prevResult.rows.length > 0
      ? prevResult.rows[0].payload_hash
      : null;

    // 2. Generate the deterministic SHA-256 hash of the payload + previous hash
    const dataString = JSON.stringify({
      payload,
      previousHash,
      recordId,
      tableName,
    });
    const messageBuffer = new TextEncoder().encode(dataString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
    const payloadHash = encodeHex(new Uint8Array(hashBuffer));

    // 3. Store the immutable record
    await conn.queryObject`
      INSERT INTO audit_log (table_name, record_id, action, changed_by, diff, payload_hash, previous_hash) 
      VALUES (${tableName}, ${recordId}, 'FINALIZE', ${userId}, ${payload}, ${payloadHash}, ${previousHash})
    `;

    return payloadHash;
  } finally {
    conn.release();
  }
}

/**
 * Retrieves the audit trail for a specific record, including hashes.
 */
export async function getAuditTrailForRecord(
  tableName: string,
  recordId: number,
) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<AuditLog>`
      SELECT * FROM audit_log 
      WHERE table_name = ${tableName} AND record_id = ${recordId}
      ORDER BY changed_at DESC
    `;
    return result.rows;
  } finally {
    conn.release();
  }
}
