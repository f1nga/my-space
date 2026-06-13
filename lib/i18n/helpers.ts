import type { EstatObjectiu } from "@/lib/types";
import { daysRemaining } from "@/lib/objectius";
import type { Translator } from "./types";

export function getMotivationMessage(
  t: Translator,
  taxaCompletacio: number,
  actius: number,
): string {
  if (actius === 0) return t("objectives.motivationEmpty");
  if (taxaCompletacio >= 80) return t("objectives.motivation80");
  if (taxaCompletacio >= 50) return t("objectives.motivation50");
  if (taxaCompletacio >= 25) return t("objectives.motivation25");
  return t("objectives.motivationStart");
}

export function getTimeLabel(
  t: Translator,
  dataFinal: Date,
  estat: EstatObjectiu,
): string {
  if (estat === "COMPLETAT") return t("objectives.timeCompleted");
  if (estat === "ABANDONAT") return t("objectives.timeAbandoned");
  const days = daysRemaining(dataFinal);
  if (days < 0) {
    return t("objectives.timeOverdue", { count: Math.abs(days) });
  }
  if (days === 0) return t("objectives.timeEndsToday");
  if (days === 1) return t("objectives.timeOneDayLeft");
  return t("objectives.timeDaysLeft", { count: days });
}
