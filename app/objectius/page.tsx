import { PageHeader } from "@/components/layout/PageHeader";
import { ObjectiusClient } from "@/components/objectius/ObjectiusClient";
import { serializeObjectiu } from "@/components/objectius/types";
import {
  getObjectius,
  getObjectiusStats,
  normalizeCategoria,
  normalizeEstat,
} from "@/lib/data/objectius";
import { getTranslations } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function ObjectiusPage() {
  const [objectius, stats, t] = await Promise.all([
    getObjectius(),
    getObjectiusStats(),
    getTranslations(),
  ]);

  const initial = objectius.map((o) =>
    serializeObjectiu(o, normalizeCategoria, normalizeEstat),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        eyebrow={t("objectives.eyebrow")}
        title={t("objectives.title")}
        description={t("objectives.description")}
      />
      <section className="flex-1 px-6 py-6 md:px-10">
        <ObjectiusClient initial={initial} stats={stats} />
      </section>
    </div>
  );
}
