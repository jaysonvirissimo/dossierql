import { leadFacts } from "../../engine/board.ts";
import { useWorkspace } from "./context.ts";
import { FactLine } from "./Evidence.tsx";
import { hours } from "./describe.ts";
import { STATUS_WORDS, stageLeads } from "./leads.ts";

/**
 * The case board (SDD 8.2): every lead the stage keeps in contention, the
 * true one among them, with what the player's responses show about each.
 * The board lays out the facts. The form judges them, and only the player
 * rules a lead out.
 */
export function LeadBoard({ onShowMap }: { onShowMap(): void }) {
  const { env, state, stage } = useWorkspace();
  const leads = stageLeads(env, state, stage);
  if (leads.length === 0) return null;
  const priced = state.clock !== "none";
  return (
    <>
      <h3>Case board</h3>
      <p className="tool__lede">
        Each card is one lead and the facts your responses hold about it. To
        strike a lead off, choose it on the form and press Rule out.
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
