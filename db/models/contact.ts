// db/models/contact.ts
import { getConnection } from "../connection.ts";

export type Contact = {
  contact_id: number;
  party_id: number;
  fullname: string;
  position: string | null;
  email: string | null;
  phone: string | null;
};

export async function getContactsByParty(partyId: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<
      Contact
    >`SELECT * FROM contacts WHERE party_id = ${partyId} ORDER BY fullname`;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function createContact(contact: Omit<Contact, "contact_id">) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<
      { contact_id: number }
    >`INSERT INTO contacts (party_id, fullname, position, email, phone) VALUES (${contact.party_id}, ${contact.fullname}, ${contact.position}, ${contact.email}, ${contact.phone}) RETURNING contact_id`;
    return result.rows[0].contact_id;
  } finally {
    conn.release();
  }
}
