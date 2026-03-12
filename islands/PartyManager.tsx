// islands/PartyManager.tsx
import { useEffect, useState } from "preact/hooks";
import { MOUPartyDetail } from "../db/models/mou_parties.ts";
import { Party } from "../db/models/party.ts";
import { IconAlert, IconUsers } from "../components/Icons.tsx";

interface PartyManagerProps {
  mouId: number;
}

export default function PartyManager({ mouId }: PartyManagerProps) {
  const [mouParties, setMouParties] = useState<MOUPartyDetail[]>([]);
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [role, setRole] = useState("External Partner");

  // New Party Form
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyType, setNewPartyType] = useState("Corporate");

  const loadData = async () => {
    setLoading(true);
    try {
      const [partiesRes, allRes] = await Promise.all([
        fetch(`/api/mou/${mouId}/parties`),
        fetch("/api/parties"),
      ]);

      if (!partiesRes.ok || !allRes.ok) {
        throw new Error("Failed to load parties data.");
      }

      setMouParties(await partiesRes.json());
      setAllParties(await allRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mouId]);

  const handleAddExisting = async (e: Event) => {
    e.preventDefault();
    if (!selectedPartyId || !role) return;

    try {
      const res = await fetch(`/api/mou/${mouId}/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party_id: Number(selectedPartyId), role }),
      });
      if (!res.ok) throw new Error(await res.text());

      setIsAdding(false);
      setSelectedPartyId("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreateNew = async (e: Event) => {
    e.preventDefault();
    if (!newPartyName) return;

    try {
      // 1. Create the party globally
      const createRes = await fetch(`/api/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPartyName, type: newPartyType }),
      });
      if (!createRes.ok) throw new Error(await createRes.text());
      const { party_id } = await createRes.json();

      // 2. Attach to MOU
      const attachRes = await fetch(`/api/mou/${mouId}/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party_id: Number(party_id), role }),
      });
      if (!attachRes.ok) throw new Error(await attachRes.text());

      setIsCreatingNew(false);
      setIsAdding(false);
      setNewPartyName("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRemove = async (partyId: number) => {
    if (!confirm("Remove this party from the MOU?")) return;

    try {
      const res = await fetch(`/api/mou/${mouId}/parties?party_id=${partyId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return (
      <div class="p-8 text-center animate-pulse text-muted-foreground">
        Loading parties...
      </div>
    );
  }

  // Filter out parties already attached
  const availableParties = allParties.filter((p) =>
    !mouParties.some((mp) => mp.party_id === p.party_id)
  );

  return (
    <div class="space-y-6">
      {error && (
        <div class="p-6 bg-background text-rose-500 border-2 border-rose-500 rounded-none flex items-start gap-4 animate-fade-in shadow-[4px_4px_0px_0px_currentColor]">
          <IconAlert class="w-6 h-6 shrink-0" />{" "}
          <p class="font-bold text-sm tracking-widest uppercase">{error}</p>
        </div>
      )}

      {/* Header Actions */}
      <div class="flex justify-between items-center mb-10 border-b-4 border-foreground pb-4">
        <h2 class="text-3xl font-black font-serif uppercase tracking-tighter flex items-center gap-4">
          <IconUsers class="w-8 h-8" />{" "}
          Associated Entities ({mouParties.length})
        </h2>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            class="btn-outline"
          >
            + Register Entity
          </button>
        )}
      </div>

      {/* Quick Add Forms */}
      {isAdding && (
        <div class="glass-card p-10 bg-background border-2 border-foreground mb-12 animate-fade-in shadow-[8px_8px_0px_0px_currentColor]">
          <div class="flex justify-between items-center mb-8 border-b-2 border-border pb-4">
            <h3 class="font-bold font-serif text-2xl uppercase tracking-tighter">
              {isCreatingNew
                ? "Register New Organization"
                : "Attach Existing Organization"}
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              class="w-10 h-10 border-2 border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors font-mono font-bold text-xl"
            >
              ✕
            </button>
          </div>

          {!isCreatingNew
            ? (
              <form onSubmit={handleAddExisting} class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Select Organization
                    </label>
                    <select
                      value={selectedPartyId}
                      onChange={(e) =>
                        setSelectedPartyId(
                          (e.target as HTMLSelectElement).value,
                        )}
                      class="w-full px-4 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg"
                      required
                    >
                      <option value="" disabled>-- Select Entity --</option>
                      {availableParties.map((p) => (
                        <option key={p.party_id} value={p.party_id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Role in Protocol
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) =>
                        setRole((e.target as HTMLInputElement).value)}
                      class="w-full px-4 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg"
                      placeholder="e.g. Lead Partner"
                      required
                    />
                  </div>
                </div>
                <div class="flex items-center justify-between pt-6 border-t-2 border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    class="text-xs text-primary font-bold uppercase tracking-widest hover:border-b-2 border-primary"
                  >
                    + Create New Org Instead
                  </button>
                  <button
                    type="submit"
                    class="btn"
                  >
                    Attach Entity
                  </button>
                </div>
              </form>
            )
            : (
              <form onSubmit={handleCreateNew} class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Legal Name *
                    </label>
                    <input
                      type="text"
                      value={newPartyName}
                      onChange={(e) =>
                        setNewPartyName((e.target as HTMLInputElement).value)}
                      class="w-full px-4 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg"
                      placeholder="Acme Corp LLC"
                      required
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Entity Type *
                    </label>
                    <select
                      value={newPartyType}
                      onChange={(e) =>
                        setNewPartyType((e.target as HTMLSelectElement).value)}
                      class="w-full px-4 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg"
                      required
                    >
                      <option value="Corporate">Corporate</option>
                      <option value="Government">Government</option>
                      <option value="Non-Profit">Non-Profit</option>
                      <option value="Educational">Educational</option>
                    </select>
                  </div>
                  <div class="space-y-2 md:col-span-3">
                    <label class="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Role Designation *
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) =>
                        setRole((e.target as HTMLInputElement).value)}
                      class="w-full px-4 py-4 bg-transparent border-2 border-border focus:border-foreground focus:outline-none transition-colors font-serif text-lg"
                      required
                    />
                  </div>
                </div>
                <div class="flex items-center justify-between pt-6 border-t-2 border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    class="text-xs text-muted-foreground font-bold uppercase tracking-widest hover:text-foreground hover:border-b-2 border-foreground"
                  >
                    ← Return to Existing
                  </button>
                  <button
                    type="submit"
                    class="btn"
                  >
                    Create & Attach
                  </button>
                </div>
              </form>
            )}
        </div>
      )}

      {/* Parties Grid */}
      <div class="grid gap-6">
        {mouParties.length === 0
          ? (
            <div class="p-16 text-center border-4 border-dashed border-border bg-transparent">
              <IconUsers class="w-16 h-16 mx-auto mb-6 opacity-30" />
              <h3 class="font-black text-2xl font-serif uppercase tracking-tighter mb-2">
                Zero Entities Attached
              </h3>
              <p class="text-muted-foreground text-sm font-bold uppercase tracking-widest">
                Attach external network targets to execute protocol.
              </p>
            </div>
          )
          : (
            mouParties.map((party) => (
              <div
                key={party.party_id}
                class="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between group animate-slide-up gap-6"
              >
                <div class="flex items-center gap-6">
                  <div class="w-16 h-16 bg-muted text-foreground flex items-center justify-center font-serif font-black text-3xl border-2 border-border group-hover:bg-foreground group-hover:text-background transition-colors">
                    {party.name.charAt(0)}
                  </div>
                  <div>
                    <h4 class="font-bold font-serif text-2xl leading-none uppercase tracking-tighter mb-2">
                      {party.name}
                    </h4>
                    <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {party.role}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-6 self-start md:self-auto">
                  <span class="text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 border-foreground text-foreground">
                    {party.type || "Organization"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(party.party_id)}
                    class="w-10 h-10 flex items-center justify-center border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors font-mono font-bold text-xl"
                    title="Terminate Entity"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
}
