import { useState } from "react";
import { leadFacts } from "../../engine/board.ts";
import { COSTS } from "../../engine/clock.ts";
import { useWorkspace } from "./context.ts";
import { FactLine } from "./Evidence.tsx";
import { hours } from "./describe.ts";
import {
  leadCountryActions,
  STATUS_WORDS,
  stageLeads,
  type LeadView,
} from "./leads.ts";

/**
 * The case board (SDD 8.2): every lead the stage keeps in contention, the
 * true one among them, with what the player's responses show about each.
 * The board lays out the facts and judges nothing. Each card that is not
 * ruled out offers Rule out, which the archive judges as it judges the
 * form's button. Every such card offers it, the true lead's included, so
 * the button shows nothing about which lead can be ruled out (SDD 3.5).
 */
export function LeadBoard({ onShowMap }: { onShowMap(): void }) {
  const { env, state, stage, dispatch } = useWorkspace();
  // The archive's answer to the last Rule out pressed on a card, shown on
  // that card, where the player pressed it.
  const [refusal, setRefusal] = useState<{ leadId: string; text: string }>();
  const leads = stageLeads(env, state, stage);
  if (leads.length === 0) return null;
  const priced = state.clock !== "none";
  const closed = state.status === "complete" || state.clock === "ended";
  const refutable = Object.values(stage.leadOutcomes ?? {}).some(
    (outcome) => outcome.refutation,
  );
  const answer = (leadId: string, outcome: ReturnType<typeof dispatch>) =>
    setRefusal(
      outcome.notice?.kind === "refused"
        ? { leadId, text: outcome.notice.text }
        : undefined,
    );
  const ruleOut = (leadId: string) =>
    answer(leadId, dispatch({ type: "rule-out", leadId }));
  // A field check is judged on the lead's own form, so the form takes the
  // country the card shows first, as the map does.
  const fieldCheck = (lead: LeadView) => {
    leadCountryActions(state, stage, lead).forEach(dispatch);
    answer(lead.id, dispatch({ type: "field-check", leadId: lead.id }));
  };
  return (
    <>
      <h3>Case board</h3>
      <p className="tool__lede">
        Each card is one lead and the facts your responses hold about it. When a
        fact contradicts a lead, press Rule out on that lead’s card. The archive
        checks your responses for the fact before it strikes the lead off, and a
        refusal costs nothing.
      </p>
      <ul className="board" data-testid="case-board">
        {leads.map((lead) => {
          const facts = leadFacts(stage, state.ledger, lead.id);
          return (
            <li
              key={lead.id}
              className="board__lead"
              data-status={lead.status}
              data-testid={`lead-${lead.id}`}
            >
              <p className="board__head">
                <span className="board__label">{lead.label}</span>
                <span className="label">{STATUS_WORDS[lead.status]}</span>
              </p>
              {lead.city && lead.country && (
                <p className="board__place">
                  {lead.city.name}, {lead.country.name}
                  {priced &&
                    lead.hours > 0 &&
                    ` · a journey of ${hours(lead.hours)}`}{" "}
                  <button
                    type="button"
                    className="button button--quiet button--small"
                    onClick={onShowMap}
                  >
                    Show on the map
                  </button>
                </p>
              )}
              {priced && lead.fieldCheckHours !== undefined && (
                <p className="board__prices" data-testid="lead-prices">
                  A field check sends someone to the place to report on this
                  lead, while you stay at your desk. It costs{" "}
                  {hours(lead.fieldCheckHours)}. A query to the archive costs{" "}
                  {hours(COSTS.transmission)}.
                </p>
              )}
              {((refutable && lead.status !== "ruled-out") ||
                lead.fieldCheckHours !== undefined) && (
                <p className="board__actions">
                  {refutable && lead.status !== "ruled-out" && (
                    <button
                      type="button"
                      className="button button--small"
                      data-sound="rule-out"
                      disabled={closed}
                      onClick={() => ruleOut(lead.id)}
                    >
                      {priced ? "Rule out (free)" : "Rule out"}
                    </button>
                  )}{" "}
                  {lead.fieldCheckHours !== undefined && (
                    <button
                      type="button"
                      className="button button--small"
                      disabled={closed}
                      onClick={() => fieldCheck(lead)}
                    >
                      Order a field check
                      {priced ? ` (${hours(lead.fieldCheckHours)})` : ""}
                    </button>
                  )}
                </p>
              )}
              {refusal?.leadId === lead.id && lead.status !== "ruled-out" && (
                <p className="note note--warn" aria-live="polite">
                  {refusal.text}
                </p>
              )}
              {facts.length === 0 ? (
                <p className="draft__none">
                  Your responses hold no fact about this lead yet.
                </p>
              ) : (
                <ul className="evidence-chain__facts">
                  {facts.map((key) => (
                    <FactLine key={key} factKey={key} />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
