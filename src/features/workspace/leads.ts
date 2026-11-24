import {
  bindingTypes,
  leadBinding,
  type City,
  type Country,
  type Stage,
} from "../../content/types.ts";
import { travelHours } from "../../engine/clock.ts";
import { refOf } from "../../graphql/store.ts";
import { labelOf, type Ledger } from "./describe.ts";
import {
  fieldCheckCost,
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
  /**
   * The price of a field check on the lead, while one is still on offer:
   * the stage writes a check for it, and the lead is neither ruled out nor
   * already checked. The card shows it beside the price of one query.
   */
  fieldCheckHours?: number;
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
    const status = leadStatus(state, id);
    const fieldCheckOpen =
      status === "open" && Boolean(stage.leadOutcomes?.[id]?.fieldCheck);
    return {
      id,
      label: lead.label,
      ...(city ? { city } : {}),
      ...(country ? { country } : {}),
      hours,
      ...(fieldCheckOpen
        ? { fieldCheckHours: fieldCheckCost(env, state, id) }
        : {}),
      status,
    };
  });
}

export const STATUS_WORDS: Record<LeadStatus, string> = {
  open: "In contention",
  "ruled-out": "Ruled out",
  "field-checked": "Field check made",
};

/**
 * How a form's box names a record. A lead the stage lists is offered under
 * the label the briefing and the case board give it, with the record's own
 * label after it, so that the box and the board read alike.
 */
export function optionLabel(
  stage: Stage,
  type: string,
  id: string,
  ledger: Ledger,
): string {
  const own = labelOf(refOf(type, id), ledger);
  const lead = stage.leads?.[id];
  return lead && bindingTypes(stage)[leadBinding(stage)] === type
    ? `${lead.label} (${own})`
    : own;
}
