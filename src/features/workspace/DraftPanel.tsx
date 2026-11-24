import {
  bindingTypes,
  leadBinding,
  referenceOperations,
  solutionBindings,
} from "../../content/types.ts";
import { COSTS, travelHours } from "../../engine/clock.ts";
import {
  emptyDraft,
  fromLedger,
  reviewDraft,
  type ClaimReview,
} from "../../engine/draft.ts";
import {
  deskStages,
  fieldCheckCost,
  formHold,
  knownRecords,
  proceedCost,
  warrantRejectionCost,
} from "../../engine/mission.ts";
import { parseRef, refOf } from "../../graphql/store.ts";
import { useWorkspace } from "./context.ts";
import { describeFact, hours, labelOf, typeWords, words } from "./describe.ts";
import { EvidenceChain, ReturnedForm } from "./Evidence.tsx";
import { optionLabel } from "./leads.ts";

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
  const warrant = stage.solution.type === "warrant";
  const formName = travel ? "Travel order" : warrant ? "Warrant" : "Deduction";
  const closed = state.status === "complete" || state.clock === "ended";
  const timed = state.clock === "active";

  const byLabel = (type: string) =>
    knownRecords(state, type)
      .map((id) => ({ id, label: optionLabel(stage, type, id, state.ledger) }))
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
  // Where the archive checks the form, nothing is reviewed before it is
  // submitted, so the form shows no status.
  const review =
    draft && !fromLedger(stage)
      ? reviewDraft(stage, draft, state.ledger)
      : null;
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
  // A blank box, or another lead still in contention, holds the form back
  // before any claim is judged. The button stays inactive and says why.
  const hold =
    draft && review && !draft.ruledOut && stage.paperwork !== "terminal"
      ? formHold(stage, state, draft.leadId, review.unnamed)
      : null;
  // A case with no clock prices nothing, so its buttons quote no price.
  const cost = (n: number) =>
    state.clock === "none" ? "" : ` (${timed && n > 0 ? hours(n) : "free"})`;
  // A journey is priced to the country the draft names, when it names one.
  const named = others
    .filter(([name]) => types[name] === "Country")
    .map(([name]) => draft?.bindings[name])
    .find((code) => code);
  // Until the form names a country, the journey has no price: the next
  // stage's country is the answer, so its price would give the answer away.
  const countryBox = others.some(([name]) => types[name] === "Country");
  const journey: number | null = named
    ? named !== stage.location
      ? travelHours(env.world, stage.location, named)
      : 0
    : countryBox
      ? null
      : proceedCost(env, state);

  return (
    <section className="draft paper" aria-labelledby="draft-title">
      <header className="panel-head">
        <h2 id="draft-title">{formName}</h2>
        {!fromLedger(stage) && (
          <label className="draft__open">
            <span className="label">Open a lead</span>
            <select
              // Shows the open lead, so the choice is seen to have taken.
              value={
                known.some(({ id }) => id === active) ? (active ?? "") : ""
              }
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
        )}
      </header>

      {!fromLedger(stage) && opened.length > 0 && (
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

      {fromLedger(stage) ? (
        <DecisionForm known={known} />
      ) : !draft || !review ? (
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
              {optionLabel(stage, leadType, draft.leadId, state.ledger)}
            </strong>
            {draft.ruledOut && (
              <span className="chip chip--bad">Ruled out</span>
            )}
          </p>
          <DestinationNote />

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
                data-sound="rule-out"
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
                data-sound="field-check"
                disabled={closed}
                onClick={() =>
                  dispatch({ type: "field-check", leadId: draft.leadId })
                }
              >
                Order a field check
                {cost(fieldCheckCost(env, state, draft.leadId))}
              </button>
            )}
            {warrant && stage.paperwork === "terminal" ? (
              <WarrantFromTerminal
                leadId={draft.leadId}
                rejection={warrantRejectionCost(state)}
              />
            ) : travel && stage.paperwork === "terminal" ? (
              <p className="draft__status" data-testid="terminal-order">
                At your clearance, you file this travel order from the terminal.
                When the claims are supported, transmit a mutation with{" "}
                <code>fileTravelOrder</code>. Give <code>following</code> the
                reference of this draft&apos;s lead, <code>{draft.leadId}</code>
                , and give <code>to</code> the country&apos;s name.
                {timed &&
                  journey !== null &&
                  journey > 0 &&
                  ` The order costs one hour to transmit, and the journey takes ${hours(journey)} more.`}
              </p>
            ) : (
              <button
                type="button"
                className="button button--primary"
                data-sound={travel ? "travel" : "primary"}
                disabled={closed || draft.ruledOut || hold !== null}
                aria-describedby={hold ? "form-hold" : undefined}
                onClick={() =>
                  dispatch({ type: "proceed", leadId: draft.leadId })
                }
              >
                {travel
                  ? `Travel${journey === null ? "" : cost(journey)}`
                  : warrant
                    ? applyLabel(warrantRejectionCost(state))
                    : "Submit deduction"}
              </button>
            )}
          </div>
          {hold && !closed && (
            <p id="form-hold" className="draft__status" data-testid="form-hold">
              {hold}
            </p>
          )}
          {!review.allSupported &&
            !draft.ruledOut &&
            !(onlyChoices && hold && review.unnamed.length > 0) && (
              <p className="draft__status">
                {onlyChoices && travel && stage.paperwork === "terminal"
                  ? "The facts you cited are complete. You can leave the country blank: the travel order you file from the terminal chooses it from its to argument."
                  : onlyChoices
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
        {notice?.kind === "returned" && (
          <ReturnedForm
            returned={notice.returned}
            fieldCheck={cost(
              fieldCheckCost(env, state, notice.returned.leadId),
            )}
            transmission={cost(COSTS.transmission)}
          />
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
          <div className="note dispatch dispatch--new">
            <p className="label">
              Dispatch
              {state.clock === "none"
                ? ""
                : notice.dispatch.cost > 0
                  ? ` · ${hours(notice.dispatch.cost)} spent`
                  : " · no time spent"}
            </p>
            <p>{notice.dispatch.text}</p>
            <EvidenceChain dispatch={notice.dispatch} />
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * The form at a stage the archive checks (SDD 3.2). The player chooses a
 * record for each box and submits. The archive then looks through every
 * response for evidence, so the form shows no status before that.
 */
function DecisionForm({
  known,
}: {
  known: readonly { id: string; label: string }[];
}) {
  const { env, state, stage, stageState, dispatch, clearNotice } =
    useWorkspace();
  const types = bindingTypes(stage);
  const lead = leadBinding(stage);
  const leadType = types[lead] ?? "";
  const travel = stage.solution.type === "destination";
  const warrant = stage.solution.type === "warrant";
  const formName = travel ? "travel order" : warrant ? "warrant" : "deduction";
  const closed = state.status === "complete" || state.clock === "ended";
  const timed = state.clock === "active";
  const active = stageState.activeLead;
  const draft = active
    ? (stageState.drafts[active] ?? emptyDraft(active))
    : null;
  const others = solutionBindings(stage).filter(([name]) => name !== lead);
  const hold =
    draft && !draft.ruledOut && stage.paperwork !== "terminal"
      ? formHold(
          stage,
          state,
          draft.leadId,
          reviewDraft(stage, draft, state.ledger).unnamed,
        )
      : null;
  const refutable = Object.values(stage.leadOutcomes ?? {}).some(
    (o) => o.refutation,
  );
  const cost = (n: number) =>
    state.clock === "none" ? "" : ` (${timed && n > 0 ? hours(n) : "free"})`;
  const named = others
    .filter(([name]) => types[name] === "Country")
    .map(([name]) => draft?.bindings[name])
    .find((code) => code);
  // Until the form names a country, the journey has no price: the next
  // stage's country is the answer, so its price would give the answer away.
  const countryBox = others.some(([name]) => types[name] === "Country");
  const journey: number | null = named
    ? named !== stage.location
      ? travelHours(env.world, stage.location, named)
      : 0
    : countryBox
      ? null
      : proceedCost(env, state);
  const options = (type: string) =>
    knownRecords(state, type)
      .map((id) => ({ id, label: optionLabel(stage, type, id, state.ledger) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  const box = (name: string) => stage.labels?.[name] ?? words(name);

  return (
    <div className="draft__body decision">
      <p className="draft__claims-intro">
        Choose a record for each box. When you submit the {formName}, the
        archive looks through every response you have received for facts that
        prove each of these claims about the records you chose:
      </p>
      <ul className="claims claims--preview">
        {stage.claims.map((claim) => (
          <li key={claim.id}>{claim.prompt}</li>
        ))}
      </ul>
      <DestinationNote />

      <label className="draft__name">
        <span className="label">{box(lead)}</span>
        <select
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
              : "Not yet chosen"}
          </option>
          {known.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
              {stageState.drafts[id]?.ruledOut ? " (ruled out)" : ""}
            </option>
          ))}
        </select>
      </label>

      {others.map(([name]) => {
        const type = types[name] ?? "";
        const list = options(type);
        return (
          <label key={name} className="draft__name">
            <span className="label">{box(name)}</span>
            <select
              value={draft?.bindings[name] ?? ""}
              disabled={closed || !draft || draft.ruledOut}
              onChange={(event) => {
                if (!draft) return;
                clearNotice();
                dispatch({
                  type: "name",
                  leadId: draft.leadId,
                  binding: name,
                  value: event.target.value,
                });
              }}
            >
              <option value="">
                {list.length === 0
                  ? `No ${words(type)} retrieved yet`
                  : "Not yet chosen"}
              </option>
              {list.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        );
      })}

      {draft?.ruledOut && (
        <p className="draft__status">
          <span className="chip chip--bad">Ruled out</span> You have ruled out{" "}
          {labelOf(refOf(leadType, draft.leadId), state.ledger)}. Choose another{" "}
          {words(leadType)} for “{box(lead)}”.
        </p>
      )}

      <div className="draft__actions">
        {refutable && (
          <button
            type="button"
            className="button"
            data-sound="rule-out"
            disabled={closed || !draft || draft.ruledOut}
            onClick={() =>
              draft && dispatch({ type: "rule-out", leadId: draft.leadId })
            }
          >
            Rule out this {words(leadType)} (free)
          </button>
        )}
        {warrant && stage.paperwork === "terminal" ? (
          <WarrantFromTerminal
            {...(draft ? { leadId: draft.leadId } : {})}
            rejection={warrantRejectionCost(state)}
          />
        ) : travel && stage.paperwork === "terminal" ? (
          <p className="draft__status" data-testid="terminal-order">
            At your clearance, you file this travel order from the terminal.
            Transmit a mutation with <code>fileTravelOrder</code>. Give{" "}
            <code>following</code> the reference of the {words(leadType)} you
            are following
            {draft ? (
              <>
                , <code>{draft.leadId}</code>
              </>
            ) : null}
            , and give <code>to</code> the country&apos;s name. The archive
            checks the claims above when it receives the order.
            {timed &&
              journey !== null &&
              journey > 0 &&
              ` The order costs one hour to transmit, and the journey takes ${hours(journey)} more.`}
          </p>
        ) : (
          <button
            type="button"
            className="button button--primary"
            data-sound={travel ? "travel" : "primary"}
            disabled={closed || !draft || draft.ruledOut || hold !== null}
            aria-describedby={hold ? "form-hold" : undefined}
            onClick={() =>
              draft && dispatch({ type: "proceed", leadId: draft.leadId })
            }
          >
            {travel
              ? `Travel${journey === null ? "" : cost(journey)}`
              : warrant
                ? applyLabel(warrantRejectionCost(state))
                : "Submit deduction"}
          </button>
        )}
      </div>
      {hold && !closed && (
        <p id="form-hold" className="draft__status" data-testid="form-hold">
          {hold}
        </p>
      )}
    </div>
  );
}

/**
 * Where a travel order sends the player. Whatever the briefing calls the
 * place, the order names a country, and this says which box holds it.
 */
function DestinationNote() {
  const { stage } = useWorkspace();
  if (stage.solution.type !== "destination" || stage.paperwork === "terminal") {
    return null;
  }
  const types = bindingTypes(stage);
  const box = solutionBindings(stage).find(
    ([name]) => types[name] === "Country",
  )?.[0];
  if (!box) return null;
  return (
    <p className="draft__status" data-testid="destination-note">
      A travel order sends you to a country: the one you choose for “
      {stage.labels?.[box] ?? words(box)}”.
    </p>
  );
}

/** The label of the warrant control, with what a rejection costs. */
function applyLabel(rejection: number): string {
  return rejection > 0
    ? `Apply for the warrant (a rejection costs ${hours(rejection)})`
    : "Apply for the warrant";
}

/**
 * Where a warrant is filed from the terminal (SDD 6.2), the form says how,
 * and what a rejection costs.
 */
function WarrantFromTerminal({
  leadId,
  rejection,
}: {
  leadId?: string;
  rejection: number;
}) {
  const { env, stage } = useWorkspace();
  // From clearance 13 a warrant may be for an officer, given by name
  // (SDD 3.4); an operative is given by codename.
  const officer = bindingTypes(stage)[leadBinding(stage)] === "Officer";
  const lead = leadId
    ? officer
      ? String(env.store.get("Officer", leadId)?.name ?? leadId)
      : leadId
    : undefined;
  const kind = officer ? "officer" : "operative";
  return (
    <p className="draft__status" data-testid="terminal-warrant">
      At your clearance, you file this warrant from the terminal. Transmit a
      mutation with <code>requestWarrant</code>, and fill the box{" "}
      <code>{kind}</code> of its <code>subject</code> with the {kind}&apos;s{" "}
      {officer ? "name" : "codename"}
      {lead ? (
        <>
          , <code>{lead}</code>
        </>
      ) : null}
      . The archive checks the claims above when it receives the warrant.
      Choosing an {kind} in the box above files nothing: the box shows which{" "}
      {kind} the claims are about, and lets you rule one out where the case
      allows it.
      {rejection > 0 &&
        ` A warrant that the magistrate rejects costs ${hours(rejection)}.`}
    </p>
  );
}
