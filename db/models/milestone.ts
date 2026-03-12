// db/models/milestone.ts
import { getConnection } from "../connection.ts";

export type Milestone = {
  milestone_id: number;
  mou_id: number;
  title: string;
  due_date: Date;
  responsible_party_id: number | null;
  status: "Pending" | "In Progress" | "Done" | "Missed";
  notes: string | null;
};

export async function getMilestonesByMOU(mouId: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<Milestone>`
      SELECT * FROM milestones 
      WHERE mou_id = ${mouId}
      ORDER BY due_date ASC
    `;
    return result.rows;
  } finally {
    conn.release();
  }
}

export async function getMilestoneById(id: number) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<Milestone>`
      SELECT * FROM milestones WHERE milestone_id = ${id}
    `;
    return result.rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function createMilestone(
  milestone: Omit<Milestone, "milestone_id">,
) {
  const conn = await getConnection();
  try {
    const result = await conn.queryObject<{ milestone_id: number }>`
      INSERT INTO milestones (
        mou_id, title, due_date, responsible_party_id, status, notes
      ) VALUES (
        ${milestone.mou_id}, ${milestone.title}, ${milestone.due_date}, 
        ${milestone.responsible_party_id}, ${milestone.status}, ${milestone.notes}
      ) RETURNING milestone_id
    `;
    return result.rows[0].milestone_id;
  } finally {
    conn.release();
  }
}

export async function updateMilestoneStatus(
  id: number,
  status: Milestone["status"],
) {
  const conn = await getConnection();
  try {
    await conn.queryObject`
      UPDATE milestones SET status = ${status} WHERE milestone_id = ${id}
    `;
    return true;
  } finally {
    conn.release();
  }
}

export async function deleteMilestone(id: number) {
  const conn = await getConnection();
  try {
    await conn.queryObject`DELETE FROM milestones WHERE milestone_id = ${id}`;
    return true;
  } finally {
    conn.release();
  }
}
