import type { City, Country, Stage } from "../../content/types.ts";
import { travelHours } from "../../engine/clock.ts";
import {
  leadCountry,
  leadStatus,
  type Env,
  type LeadStatus,
  type MissionState,
} from "../../engine/mission.ts";

export interface LeadView {
  id: string;
  label: string;
  city?: City;
  country?: Country;
  /** The journey from the stage's country, or 0 within the same country. */
  hours: number;
  status: LeadStatus;
}

/**
 * The leads a stage keeps in contention, as the case board and the map show
 * them: where each one points and what a journey there would cost.
 */
export function stageLeads(
  env: Env,
  state: MissionState,
  stage: Stage,
): LeadView[] {
  return Object.entries(stage.leads ?? {}).map(([id, lead]) => {
    const city = lead.city
      ? env.world.cities.find((c) => c.id === lead.city)
      : undefined;
    const code = leadCountry(env, stage, id);
    const country = code
      ? env.world.countries.find((c) => c.code === code)
      : undefined;
    const hours =
      code && code !== stage.location
        ? travelHours(env.world, stage.location, code)
        : 0;
    return {
      id,
      label: lead.label,
      ...(city ? { city } : {}),
      ...(country ? { country } : {}),
      hours,
      status: leadStatus(state, id),
    };
  });
}

export const STATUS_WORDS: Record<LeadStatus, string> = {
  open: "In contention",
  "ruled-out": "Ruled out",
  "field-checked": "Field check made",
};
