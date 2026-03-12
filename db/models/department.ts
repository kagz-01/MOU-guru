// db/models/department.ts
import { getConnection } from "../connection.ts";

export type Department = {
  department_id: number;
  name: string;
};

export async function getAllDepartments() {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<
      Department
    >`SELECT * FROM departments ORDER BY name`;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function getDepartmentById(id: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<
      Department
    >`SELECT * FROM departments WHERE department_id = ${id}`;
    return result.rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function createDepartment(name: string) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<
      { department_id: number }
    >`INSERT INTO departments (name) VALUES (${name}) RETURNING department_id`;
    return result.rows[0].department_id;
  } finally {
    conn.release();
  }
}
