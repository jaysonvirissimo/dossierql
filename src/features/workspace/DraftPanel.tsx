import {
  bindingTypes,
  leadBinding,
  solutionBindings,
} from "../../content/types.ts";
import { travelHours } from "../../engine/clock.ts";
import { emptyDraft, reviewDraft } from "../../engine/draft.ts";
import {
  fieldCheckCost,
  knownRecords,
  proceedCost,
} from "../../engine/mission.ts";
import { refOf } from "../../graphql/store.ts";
import { useWorkspace } from "./context.ts";
import { describeFact, hours, labelOf, words } from "./describe.ts";

const STATUS = {
  supported: { chip: "chip--ok", text: "Supported" },
  open: { chip: "chip--open", text: "Needs evidence" },
  refuted: { chip: "chip--bad", text: "Contradicted" },
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
  // Leads are offered from what this stage's transmissions turned up.
  const here = new Set<string>();
  for (const sent of state.transmissions) {
    if (sent.stageId !== state.stageId) continue;
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
  const cost = (n: number) => (timed && n > 0 ? hours(n) : "free");
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
            value=""
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
          <p>
            A draft holds the claims you must support for one lead, and the
            findings you cite for them. Transmit a query, then open a lead here
            or cite a finding from the results.
          </p>
          <p className="draft__claims-intro">
            For this {formName.toLowerCase()}, the lead you choose must bear out
            each of these claims:
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
                      : "Not yet named"}
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
                  {STATUS[claim.status].text}
                </span>
                <span className="claim__prompt">{claim.prompt}</span>
                {claim.status === "open" &&
                  claim.unnamed.length === 0 &&
                  claim.partial && (
                    <span className="claim__hint">
                      Part of the evidence is cited. Something that completes or
                      connects it is still missing.
                    </span>
                  )}
                {claim.status === "open" && claim.unnamed.length > 0 && (
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
                Order a field check (
                {cost(fieldCheckCost(env, state, draft.leadId))})
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
              {travel ? `Travel (${cost(journey)})` : "Submit deduction"}
            </button>
          </div>
          {!review.allSupported && !draft.ruledOut && (
            <p className="draft__status">
              {review.claims.filter((c) => c.status !== "supported").length}{" "}
              claim(s) are not yet supported, so the {formName.toLowerCase()}{" "}
              cannot go in yet.
              {review.canFieldCheck &&
                " A field check investigates this lead as it stands and leaves the case open."}
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
              {notice.dispatch.cost > 0
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
