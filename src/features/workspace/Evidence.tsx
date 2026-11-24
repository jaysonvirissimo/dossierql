import { bindingTypes, leadBinding } from "../../content/types.ts";
import type { Dispatch, Returned } from "../../engine/mission.ts";
import { refOf } from "../../graphql/store.ts";
import { useWorkspace } from "./context.ts";
import { describeFact, hours, labelOf, words } from "./describe.ts";

/** One fact, with a button that opens the response it first came back in. */
export function FactLine({ factKey }: { factKey: string }) {
  const { state, view } = useWorkspace();
  const entry = state.ledger[factKey];
  if (!entry) return null;
  const source = entry.sources[0];
  return (
    <li>
      {describeFact(entry.fact, state.ledger)}
      {source && (
        <button
          type="button"
          className="button button--quiet button--small"
          onClick={() => view(source.transmission)}
        >
          Source: transmission {source.transmission}
        </button>
      )}
    </li>
  );
}

/**
 * The facts a form rested on, claim by claim, each linked to the response
 * that first returned it (SDD 3.2).
 */
export function EvidenceChain({ dispatch }: { dispatch: Dispatch }) {
  const { env } = useWorkspace();
  const claims = env.mission.stages[dispatch.stageId]?.claims ?? [];
  const evidence = (dispatch.evidence ?? []).filter((e) => e.facts.length > 0);
  if (evidence.length === 0) return null;
  return (
    <div className="evidence-chain" data-testid="evidence-chain">
      <p className="label">
        {dispatch.kind === "ruled-out"
          ? "The facts in your responses that contradict a claim"
          : "The evidence the archive found in your responses"}
      </p>
      <ul className="evidence-chain__claims">
        {evidence.map(({ claim, facts }) => (
          <li key={claim}>
            <p className="evidence-chain__prompt">
              {claims.find((c) => c.id === claim)?.prompt ?? claim}
            </p>
            <ul className="evidence-chain__facts">
              {facts.map((key) => (
                <FactLine key={key} factKey={key} />
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CHIP = {
  supported: { chip: "chip--ok", text: "Established" },
  open: { chip: "chip--open", text: "Not yet established" },
  refuted: { chip: "chip--bad", text: "Contradicted" },
} as const;

/**
 * A form the archive returned. It says which claims the player's responses
 * prove, and for the rest, how far the responses reach from the records on
 * the form. It never says which field is missing (SDD 3.2).
 */
export function ReturnedForm({
  returned,
  fieldCheck,
}: {
  returned: Returned;
  /** The price shown on the field check button, such as " (2 hours)". */
  fieldCheck: string;
}) {
  const { stage, state, dispatch } = useWorkspace();
  const types = bindingTypes(stage);
  const label = (name: string, id: string) =>
    labelOf(refOf(types[name] ?? "", id), state.ledger);
  const box = (name: string) => stage.labels?.[name] ?? words(name);
  const leadName = label(leadBinding(stage), returned.leadId);
  const draft = state.stages[state.stageId]?.drafts[returned.leadId];
  return (
    <div className="note note--warn returned" data-testid="returned">
      <p>
        The {returned.order} comes back to you. The archive checked it against
        every response you have received, and some of its claims are not yet
        proved for {leadName}.
        {returned.cost !== undefined &&
          returned.cost > 0 &&
          ` The magistrate rejected the warrant, and the rejection took ${hours(returned.cost)}.`}
      </p>
      <ul className="claims">
        {returned.claims.map((claim) => {
          const reached = Object.entries(claim.reached).map(([n, id]) =>
            label(n, id),
          );
          return (
            <li key={claim.id} className="claim" data-status={claim.status}>
              <span className={`chip ${CHIP[claim.status].chip}`}>
                {CHIP[claim.status].text}
              </span>
              <span className="claim__prompt">{claim.prompt}</span>
              {claim.status === "open" && (
                <span className="claim__hint">
                  {reached.length > 0
                    ? `Your responses connect ${leadName} to ${reached.join(" and ")}. They hold no fact that completes this claim.`
                    : `Your responses hold no fact that proves this claim about ${leadName}.`}
                </span>
              )}
              {Object.keys(claim.shows).length > 0 && (
                <span className="claim__hint">
                  {Object.entries(claim.shows)
                    .map(
                      ([n, id]) =>
                        `Your responses show ${label(n, id)} for “${box(n)}”, and the form gives ${label(n, draft?.bindings[n] ?? "")}.`,
                    )
                    .join(" ")}{" "}
                  <button
                    type="button"
                    className="button button--small"
                    onClick={() => {
                      for (const [binding, value] of Object.entries(
                        claim.shows,
                      )) {
                        dispatch({
                          type: "name",
                          leadId: returned.leadId,
                          binding,
                          value,
                        });
                      }
                    }}
                  >
                    Choose{" "}
                    {Object.entries(claim.shows)
                      .map(([n, id]) => label(n, id))
                      .join(" and ")}
                  </button>
                </span>
              )}
              {claim.status === "refuted" && claim.facts.length > 0 && (
                <div className="claim__facts">
                  <p>These facts in your responses contradict the claim:</p>
                  <ul>
                    {claim.facts.map((key) => (
                      <FactLine key={key} factKey={key} />
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p>
        You can change a choice on the form, or transmit another query. Then
        submit the {returned.order} again.
      </p>
      {returned.canFieldCheck && (
        <p>
          A field check sends someone to look into {leadName} and report back.
          Your choices on the form stay as they are.{" "}
          <button
            type="button"
            className="button button--small"
            onClick={() =>
              dispatch({ type: "field-check", leadId: returned.leadId })
            }
          >
            Order a field check{fieldCheck}
          </button>
        </p>
      )}
    </div>
  );
}
