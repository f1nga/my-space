import { PageHeader } from "@/components/layout/PageHeader";
import { ObjectiusClient } from "@/components/objectius/ObjectiusClient";
import { serializeObjectiu } from "@/components/objectius/types";
import {
  getObjectius,
  getObjectiusStats,
  normalizeCategoria,
  normalizeEstat,
} from "@/lib/data/objectius";

export const dynamic = "force-dynamic";

export default async function ObjectiusPage() {
  const [objectius, stats] = await Promise.all([
    getObjectius(),
    getObjectiusStats(),
  ]);

  const initial = objectius.map((o) =>
    serializeObjectiu(o, normalizeCategoria, normalizeEstat),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow="Objectius"
        title="Les teves fites"
        description="Defineix, segueix i celebra els teus objectius personals amb una visió clara del progrés."
      />
      <section className="flex-1 px-6 py-6 md:px-10">
        <ObjectiusClient initial={initial} stats={stats} />
      </section>
    </div>
  );
}
