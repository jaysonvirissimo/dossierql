import {
  bindingTypes,
  leadBinding,
  referenceOperations,
  solutionBindings,
} from "../../content/types.ts";
import { travelHours } from "../../engine/clock.ts";
import {
  emptyDraft,
  reviewDraft,
  type ClaimReview,
} from "../../engine/draft.ts";
import {
  deskStages,
  fieldCheckCost,
  knownRecords,
  proceedCost,
} from "../../engine/mission.ts";
import { parseRef, refOf } from "../../graphql/store.ts";
import { useWorkspace } from "./context.ts";
import { describeFact, hours, labelOf, typeWords, words } from "./describe.ts";

const STATUS = {
  supported: { chip: "chip--ok", text: "Supported" },
  open: { chip: "chip--open", text: "Needs evidence" },
  refuted: { chip: "chip--bad", text: "Contradicted" },
} as const;

const COUNTED = {
  supported: "Cited facts that support this claim:",
  open: "Cited facts that count toward this claim:",
  refuted: "Cited facts that contradict this claim:",
} as const;

export function DraftPanel() {
  const { env, state, stage, stageState, dispatch, notice, clearNotice, view } =
    useWorkspace();
  const types = bindingTypes(stage);
  const lead = leadBinding(stage);
  const leadType = types[lead] ?? "";
  const leadLabel = stage.labels?.[lead] ?? words(leadType);
  const travel = stage.solution.type === "destination";
  const formName = travel ? "Travel order" : "Deduction";
  const closed = state.status === "complete" || state.clock === "ended";
  const timed = state.clock === "active";

  const byLabel = (type: string) =>
    knownRecords(state, type)
      .map((id) => ({ id, label: labelOf(refOf(type, id), state.ledger) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  // Leads are offered from what the transmissions sent from this desk
  // turned up. Stages in one country share a desk.
  const desk = deskStages(env.mission, state.stageId);
  const here = new Set<string>();
  for (const sent of state.transmissions) {
    if (!desk.includes(sent.stageId)) continue;
    for (const { key } of sent.facts) {
      const fact = state.ledger[key]?.fact;
      if (!fact) continue;
      const refs = [
        fact.entity,
        ...(fact.value.kind === "ref" && fact.value.ref
          ? [fact.value.ref]
          : []),
        ...(fact.value.kind === "list" ? fact.value.refs : []),
      ];
      for (const ref of refs) here.add(ref);
    }
  }
  const known = byLabel(leadType).filter(({ id }) =>
    here.has(refOf(leadType, id)),
  );
  const article = /^[aeiou]/.test(words(leadType)) ? "an" : "a";
  const opened = Object.keys(stageState.drafts);
  const active = stageState.activeLead;
  const draft = active
    ? (stageState.drafts[active] ?? emptyDraft(active))
    : null;
  const review = draft ? reviewDraft(stage, draft, state.ledger) : null;
  const others = solutionBindings(stage).filter(([name]) => name !== lead);
  // The records the player chose on the form, each with the label of its box.
  const chosen = others
    .filter(([name]) => draft?.bindings[name])
    .map(
      ([name]) =>
        `${labelOf(refOf(types[name] ?? "", draft?.bindings[name] ?? ""), state.ledger)}, which you chose for “${stage.labels?.[name] ?? words(name)}” above`,
    )
    .join(" or ");
  /**
   * Says that cited facts do not connect, with the place where they part: a
   * fact that points to one record, beside a fact about another record.
   */
  const disconnected = (keys: readonly string[]): string => {
    const facts = keys
      .map((key) => state.ledger[key]?.fact)
      .filter((fact) => fact !== undefined);
    const remedy =
      "Remove a citation that does not belong, or cite a fact that joins them.";
    for (const from of facts) {
      const target = from.value.kind === "ref" ? from.value.ref : null;
      if (!target || facts.some((fact) => fact.entity === target)) continue;
      const other = facts.find(
        (fact) => parseRef(fact.entity).type === parseRef(target).type,
      );
      if (!other) continue;
      const kind = typeWords(target);
      return `The facts listed here do not connect to each other. One fact points to the ${kind} ${labelOf(target, state.ledger)}, and the fact you cited about a ${kind} is about ${labelOf(other.entity, state.ledger)}. ${remedy}`;
    }
    return `The facts listed here do not connect to each other. Each fact has to be about the record that another fact points to. ${remedy}`;
  };
  const unsupported =
    review?.claims.filter((c) => c.status !== "supported").length ?? 0;
  // A claim whose cited facts are complete, and which waits only on a box
  // the player has left blank.
  const waiting = (claim: ClaimReview) =>
    claim.status === "open" && Object.keys(claim.shows).length > 0;
  const shown = (claim: ClaimReview) =>
    Object.entries(claim.shows)
      .map(([n, id]) => labelOf(refOf(types[n] ?? "", id), state.ledger))
      .join(" and ");
  const onlyChoices =
    review !== null &&
    review.claims.every((c) => c.status === "supported" || waiting(c));
  // A case with no clock prices nothing, so its buttons quote no price.
  const cost = (n: number) =>
    state.clock === "none" ? "" : ` (${timed && n > 0 ? hours(n) : "free"})`;
  // A journey is priced to the country the draft names, when it names one.
  const named = others
    .filter(([name]) => types[name] === "Country")
    .map(([name]) => draft?.bindings[name])
    .find((code) => code);
  const journey =
    named && named !== stage.location
      ? travelHours(env.world, stage.location, named)
      : proceedCost(env, state);

  return (
    <section className="draft paper" aria-labelledby="draft-title">
      <header className="panel-head">
        <h2 id="draft-title">{formName}</h2>
        <label className="draft__open">
          <span className="label">Open a lead</span>
          <select
            // Shows the open lead, so the choice is seen to have taken.
            value={known.some(({ id }) => id === active) ? (active ?? "") : ""}
            disabled={closed || known.length === 0}
            onChange={(event) => {
              if (event.target.value) {
                clearNotice();
                dispatch({ type: "open-lead", leadId: event.target.value });
              }
            }}
          >
            <option value="">
              {known.length === 0
                ? `No ${words(leadType)} retrieved yet`
                : `Choose ${article} ${words(leadType)}`}
            </option>
            {known.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {opened.length > 0 && (
        <div className="tabs" role="tablist" aria-label="Leads">
          {opened.map((id) => {
            const out = stageState.drafts[id]?.ruledOut;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`lead-tab-${id}`}
                aria-selected={id === active}
                aria-controls="draft-body"
                className="tab"
                onClick={() => {
                  clearNotice();
                  dispatch({ type: "open-lead", leadId: id });
                }}
              >
                {labelOf(refOf(leadType, id), state.ledger)}
                {out ? " (ruled out)" : ""}
              </button>
            );
          })}
        </div>
      )}

      {!draft || !review ? (
        <div className="draft__empty">
          <ol className="draft__steps">
            <li>
              {referenceOperations(stage).length === 0
                ? "Read the results you already have. This stage needs no new query."
                : "Transmit a query and read the results."}
            </li>
            <li>
              Press Cite on the rows that support your claims. If the button
              shows a lead, pressing Cite opens the draft for that lead.
            </li>
            <li>
              If the button says only Cite, choose the {words(leadType)} your
              claim is about from Open a lead above. Then press Cite on the row.
            </li>
            <li>{travel ? "Travel." : "Submit the deduction."}</li>
          </ol>
          <p className="draft__claims-intro">
            For this {formName.toLowerCase()}, you must cite evidence that each
            of these claims is true of the lead you choose:
          </p>
          <ul className="claims claims--preview">
            {stage.claims.map((claim) => (
              <li key={claim.id}>{claim.prompt}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          id="draft-body"
          role="tabpanel"
          aria-labelledby={`lead-tab-${draft.leadId}`}
          className="draft__body"
        >
          <p className="draft__lead">
            <span className="label">{leadLabel}</span>{" "}
            <strong>
              {labelOf(refOf(leadType, draft.leadId), state.ledger)}
            </strong>
            {draft.ruledOut && (
              <span className="chip chip--bad">Ruled out</span>
            )}
          </p>

          {others.map(([name]) => {
            const type = types[name] ?? "";
            const options = byLabel(type);
            return (
              <label key={name} className="draft__name">
                <span className="label">
                  {stage.labels?.[name] ?? words(name)}
                </span>
                <select
                  value={draft.bindings[name] ?? ""}
                  disabled={closed || draft.ruledOut}
                  onChange={(event) =>
                    dispatch({
                      type: "name",
                      leadId: draft.leadId,
                      binding: name,
                      value: event.target.value,
                    })
                  }
                >
                  <option value="">
                    {options.length === 0
                      ? `No ${words(type)} retrieved yet`
                      : "Not yet chosen"}
                  </option>
                  {options.map(({ id, label }) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}

          <h3 className="draft__heading">Claims</h3>
          <ul className="claims">
            {review.claims.map((claim) => (
              <li key={claim.id} className="claim" data-status={claim.status}>
                <span className={`chip ${STATUS[claim.status].chip}`}>
                  {waiting(claim)
                    ? "Needs a choice"
                    : STATUS[claim.status].text}
                </span>
                <span className="claim__prompt">{claim.prompt}</span>
                {claim.counted.length > 0 && (
                  <div className="claim__facts">
                    <p>{COUNTED[claim.status]}</p>
                    <ul>
                      {claim.counted.map((key) => {
                        const entry = state.ledger[key];
                        return entry ? (
                          <li key={key}>
                            {describeFact(entry.fact, state.ledger)}
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
                {claim.status === "open" &&
                  claim.unnamed.length === 0 &&
                  claim.gap !== "none" && (
                    <span className="claim__hint">
                      {claim.gap === "disconnected" &&
                        disconnected(claim.counted)}
                      {claim.gap === "mismatch" &&
                        `The facts listed here connect to each other. They are not about ${chosen}.`}
                      {claim.gap === "missing" &&
                        (claim.counted.length === 1
                          ? "This fact is part of the evidence. The claim needs more facts that connect to this one."
                          : "The facts listed here connect to each other. The claim needs at least one more fact that connects to them.")}
                    </span>
                  )}
                {waiting(claim) && (
                  <span className="claim__hint">
                    The facts you cited show {shown(claim)}. Choose{" "}
                    {Object.entries(claim.shows)
                      .map(
                        ([n, id]) =>
                          `${labelOf(refOf(types[n] ?? "", id), state.ledger)} for “${stage.labels?.[n] ?? words(n)}”`,
                      )
                      .join(" and ")}{" "}
                    above.{" "}
                    <button
                      type="button"
                      className="button button--small"
                      disabled={closed || draft.ruledOut}
                      onClick={() => {
                        for (const [binding, value] of Object.entries(
                          claim.shows,
                        )) {
                          dispatch({
                            type: "name",
                            leadId: draft.leadId,
                            binding,
                            value,
                          });
                        }
                      }}
                    >
                      Choose {shown(claim)}
                    </button>
                  </span>
                )}
                {claim.status === "open" &&
                  claim.unnamed.length > 0 &&
                  !waiting(claim) && (
                    <span className="claim__hint">
                      Choose{" "}
                      {claim.unnamed
                        .map((n) => `“${stage.labels?.[n] ?? words(n)}”`)
                        .join(" and ")}{" "}
                      above first.
                    </span>
                  )}
              </li>
            ))}
          </ul>

          <h3 className="draft__heading">Citations</h3>
          {draft.citations.length === 0 ? (
            <p className="draft__none">
              Nothing cited yet. Use a Cite button in the results.
            </p>
          ) : (
            <ul className="citations">
              {draft.citations.map((citation) => (
                <li key={citation.id} className="citation">
                  <details>
                    <summary>
                      <span className="citation__label">{citation.label}</span>
                      <span className="citation__count">
                        {citation.factKeys.length === 1
                          ? "1 fact"
                          : `${String(citation.factKeys.length)} facts`}
                      </span>
                      {review.unrelated.includes(citation.id) && (
                        <span className="chip chip--open">
                          Bears on no claim for this lead
                        </span>
                      )}
                    </summary>
                    <ul className="citation__facts">
                      {citation.factKeys.map((key) => {
                        const entry = state.ledger[key];
                        if (!entry) return null;
                        const source = entry.sources[entry.sources.length - 1];
                        return (
                          <li key={key}>
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
                      })}
                    </ul>
                  </details>
                  <button
                    type="button"
                    className="button button--small"
                    disabled={closed}
                    aria-label={`Remove citation ${citation.label}`}
                    onClick={() =>
                      dispatch({
                        type: "uncite",
                        leadId: draft.leadId,
                        citationId: citation.id,
                      })
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="draft__actions">
            {review.refuted && !draft.ruledOut && (
              <button
                type="button"
                className="button"
                disabled={closed}
                onClick={() =>
                  dispatch({ type: "rule-out", leadId: draft.leadId })
                }
              >
                Rule out this lead (free)
              </button>
            )}
            {review.canFieldCheck && (
              <button
                type="button"
                className="button"
                disabled={closed}
                onClick={() =>
                  dispatch({ type: "field-check", leadId: draft.leadId })
                }
              >
                Order a field check
                {cost(fieldCheckCost(env, state, draft.leadId))}
              </button>
            )}
            <button
              type="button"
              className="button button--primary"
              disabled={closed || draft.ruledOut}
              onClick={() =>
                dispatch({ type: "proceed", leadId: draft.leadId })
              }
            >
              {travel ? `Travel${cost(journey)}` : "Submit deduction"}
            </button>
          </div>
          {!review.allSupported && !draft.ruledOut && (
            <p className="draft__status">
              {onlyChoices
                ? `The facts you cited are complete. Make the ${review.unnamed.length === 1 ? "choice" : "choices"} above to complete the ${formName.toLowerCase()}.`
                : `${unsupported === 1 ? "1 claim is" : `${String(unsupported)} claims are`} not yet supported, so the ${formName.toLowerCase()} cannot be accepted yet.`}
              {review.canFieldCheck &&
                " A field check sends a dispatch about the missing evidence. Your citations stay in the draft."}
            </p>
          )}
        </div>
      )}

      <div aria-live="polite" className="draft__notice">
        {notice?.kind === "refused" && (
          <p className="note note--warn">{notice.text}</p>
        )}
        {notice?.kind === "shortfall" && (
          <div className="note note--bad">
            <p>
              {notice.action} costs {hours(notice.needed)} and{" "}
              {hours(notice.left)} remain{notice.left === 1 ? "s" : ""}. Nothing
              was spent.
            </p>
            <button
              type="button"
              className="button button--small"
              onClick={() => dispatch({ type: "let-deadline-pass" })}
            >
              Let the deadline pass
            </button>
          </div>
        )}
        {notice?.kind === "dispatch" && (
          <div className="note dispatch">
            <p className="label">
              Dispatch
              {state.clock === "none"
                ? ""
                : notice.dispatch.cost > 0
                  ? ` · ${hours(notice.dispatch.cost)} spent`
                  : " · no time spent"}
            </p>
            <p>{notice.dispatch.text}</p>
          </div>
        )}
      </div>
    </section>
  );
}
