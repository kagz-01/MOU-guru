// routes/mou/[id]/edit.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { getMOUById, updateMOU } from "../../../db/models/mou.ts";
import { MOU } from "../../../db/models/mou.ts";

export const handler: Handlers<MOU | null> = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    const mou = await getMOUById(Number(id));
    if (!mou) {
      return ctx.renderNotFound();
    }
    return ctx.render(mou);
  },

  async POST(req, ctx) {
    const { id } = ctx.params;
    const form = await req.formData();

    const updates = {
      title: form.get("title")?.toString(),
      description: form.get("description")?.toString(),
      start_date: new Date(form.get("start_date")?.toString() || ""),
      end_date: new Date(form.get("end_date")?.toString() || ""),
      status: form.get("status")?.toString() as MOU["status"],
      governing_law: form.get("governing_law")?.toString(),
      confidentiality: form.get("confidentiality") === "on",
      ip_terms: form.get("ip_terms")?.toString(),
      renewal_terms: form.get("renewal_terms")?.toString(),
      termination_clause: form.get("termination_clause")?.toString(),
    };

    await updateMOU(Number(id), updates);
    return new Response("", {
      status: 303,
      headers: { Location: `/mou/${id}` },
    });
  },
};

export default function EditMOU({ data }: PageProps<MOU>) {
  return (
    <div>
      <h1>Edit MOU: {data.title}</h1>

      <form method="POST">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={data.title}
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" name="description">
            {data.description}
          </textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="start_date">Start Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={data.start_date.toISOString().split("T")[0]}
              required
            />
          </div>

          <div class="form-group">
            <label for="end_date">End Date</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={data.end_date.toISOString().split("T")[0]}
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" name="status">
            <option value="Draft" selected={data.status === "Draft"}>
              Draft
            </option>
            <option
              value="Pending Approval"
              selected={data.status === "Pending Approval"}
            >
              Pending Approval
            </option>
            <option value="Active" selected={data.status === "Active"}>
              Active
            </option>
            <option value="Expired" selected={data.status === "Expired"}>
              Expired
            </option>
            <option value="Terminated" selected={data.status === "Terminated"}>
              Terminated
            </option>
            <option value="Renewed" selected={data.status === "Renewed"}>
              Renewed
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="governing_law">Governing Law</label>
          <input
            type="text"
            id="governing_law"
            name="governing_law"
            value={data.governing_law || ""}
          />
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              name="confidentiality"
              checked={data.confidentiality}
            />
            Confidentiality Agreement
          </label>
        </div>

        <div class="form-group">
          <label for="ip_terms">IP Terms</label>
          <textarea id="ip_terms" name="ip_terms">
            {data.ip_terms || ""}
          </textarea>
        </div>

        <div class="form-group">
          <label for="renewal_terms">Renewal Terms</label>
          <textarea id="renewal_terms" name="renewal_terms">
            {data.renewal_terms || ""}
          </textarea>
        </div>

        <div class="form-group">
          <label for="termination_clause">Termination Clause</label>
          <textarea id="termination_clause" name="termination_clause">
            {data.termination_clause || ""}
          </textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn primary">Save Changes</button>
          <a href={`/mou/${data.mou_id}`} class="btn">Cancel</a>
        </div>
      </form>
    </div>
  );
}
