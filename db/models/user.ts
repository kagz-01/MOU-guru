// db/models/user.ts
import { getConnection } from "../connection.ts";

export type User = {
  user_id: number;
  email: string;
  full_name: string;
  role: "admin" | "editor" | "viewer";
  password_hash?: string; // For authentication
};

export async function getUserByEmail(email: string) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<User>`
      SELECT * FROM app_users WHERE email = ${email}
    `;
    return result.rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function getUserById(id: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<User>`
      SELECT * FROM app_users WHERE user_id = ${id}
    `;
    return result.rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function getAllUsers() {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<User>`
      SELECT user_id, email, full_name, role FROM app_users ORDER BY full_name
    `;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function createUser(user: Omit<User, "user_id">) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<{ user_id: number }>`
      INSERT INTO app_users (email, full_name, role, password_hash)
      VALUES (${user.email}, ${user.full_name}, ${user.role}, ${user.password_hash})
      RETURNING user_id
    `;
    return result.rows[0].user_id;
  } finally {
    conn.release();
  }
}
