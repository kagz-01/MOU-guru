// routes/mou/[id]/milestones.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { getMOUById } from "../../../db/models/mou.ts";
import { MOU } from "../../../db/models/mou.ts";
import {
  createMilestone,
  deleteMilestone,
  getMilestonesByMOU,
  Milestone,
  updateMilestoneStatus,
} from "../../../db/models/milestone.ts";
import { getAllParties } from "../../../db/models/party.ts";
import { Party } from "../../../db/models/party.ts";

type PageData = {
  mou: MOU;
  milestones: Milestone[];
  parties: Party[];
};

export const handler: Handlers<PageData | null> = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    const mouId = Number(id);

    const mou = await getMOUById(mouId);
    if (!mou) {
      return ctx.renderNotFound();
    }

    const milestones = await getMilestonesByMOU(mouId);
    const parties = await getAllParties();

    return ctx.render({
      mou,
      milestones,
      parties,
    });
  },

  async POST(req, ctx) {
    const { id } = ctx.params;
    const mouId = Number(id);
    const form = await req.formData();

    const action = form.get("action")?.toString();

    if (action === "create") {
      const milestone: Omit<Milestone, "milestone_id"> = {
        mou_id: mouId,
        title: form.get("title")?.toString() || "",
        due_date: new Date(form.get("due_date")?.toString() || ""),
        responsible_party_id: form.get("responsible_party_id")
          ? Number(form.get("responsible_party_id"))
          : null,
        status: "Pending",
        notes: form.get("notes")?.toString() || null,
      };

      await createMilestone(milestone);
    } else if (action === "update_status") {
      const milestoneId = Number(form.get("milestone_id"));
      const status = form.get("status")?.toString() as Milestone["status"];
      await updateMilestoneStatus(milestoneId, status);
    } else if (action === "delete") {
      const milestoneId = Number(form.get("milestone_id"));
      await deleteMilestone(milestoneId);
    }

    return new Response("", {
      status: 303,
      headers: { Location: `/mou/${id}/milestones` },
    });
  },
};

export default function MOUMilestones({ data }: PageProps<PageData>) {
  const { mou, milestones, parties } = data;

  // Helper to get status color class
  const getStatusClass = (status: Milestone["status"]) => {
    switch (status) {
      case "Done":
        return "status-done";
      case "In Progress":
        return "status-progress";
      case "Missed":
        return "status-missed";
      default:
        return "status-pending";
    }
  };

  return (
    <div>
      <h1>Milestones for: {mou.title}</h1>

      <div class="milestones-container">
        <h2>Current Milestones</h2>
        {milestones.length === 0
          ? <p>No milestones have been created for this MOU yet.</p>
          : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Due Date</th>
                  <th>Responsible Party</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((milestone) => {
                  const responsibleParty = parties.find((p) =>
                    p.party_id === milestone.responsible_party_id
                  );
                  return (
                    <tr key={milestone.milestone_id}>
                      <td>{milestone.title}</td>
                      <td>
                        {new Date(milestone.due_date).toLocaleDateString()}
                      </td>
                      <td>{responsibleParty?.name || "N/A"}</td>
                      <td>
                        <span
                          class={`status-badge ${
                            getStatusClass(milestone.status)
                          }`}
                        >
                          {milestone.status}
                        </span>
                      </td>
                      <td>{milestone.notes || ""}</td>
                      <td>
                        <form method="POST" class="inline-form">
                          <input
                            type="hidden"
                            name="action"
                            value="update_status"
                          />
                          <input
                            type="hidden"
                            name="milestone_id"
                            value={milestone.milestone_id}
                          />
                          <select name="status">
                            <option
                              value="Pending"
                              selected={milestone.status === "Pending"}
                            >
                              Pending
                            </option>
                            <option
                              value="In Progress"
                              selected={milestone.status === "In Progress"}
                            >
                              In Progress
                            </option>
                            <option
                              value="Done"
                              selected={milestone.status === "Done"}
                            >
                              Done
                            </option>
                            <option
                              value="Missed"
                              selected={milestone.status === "Missed"}
                            >
                              Missed
                            </option>
                          </select>
                          <button type="submit" class="btn small">
                            Update
                          </button>
                        </form>
                        <form method="POST" class="inline-form">
                          <input type="hidden" name="action" value="delete" />
                          <input
                            type="hidden"
                            name="milestone_id"
                            value={milestone.milestone_id}
                          />
                          <button type="submit" class="btn small danger">
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

        <h2>Add New Milestone</h2>
        <form method="POST" class="milestone-form">
          <input type="hidden" name="action" value="create" />

          <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" required />
          </div>

          <div class="form-group">
            <label for="due_date">Due Date</label>
            <input type="date" id="due_date" name="due_date" required />
          </div>

          <div class="form-group">
            <label for="responsible_party_id">Responsible Party</label>
            <select id="responsible_party_id" name="responsible_party_id">
              <option value="">-- Select a responsible party --</option>
              {parties.map((party) => (
                <option key={party.party_id} value={party.party_id}>
                  {party.name}
                </option>
              ))}
            </select>
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea id="notes" name="notes"></textarea>
          </div>

          <button type="submit" class="btn primary">Add Milestone</button>
        </form>
      </div>

      <div class="action-links">
        <a href={`/mou/${mou.mou_id}`}>Back to MOU</a>
      </div>
    </div>
  );
}
