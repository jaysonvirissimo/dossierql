import { bindingTypes, leadBinding, type Mission } from "../content/types.ts";
import { deductionChain, shownOperation } from "../engine/debrief.ts";
import type { MissionState } from "../engine/mission.ts";
import { refOf } from "../graphql/store.ts";
import { describeFact, labelOf } from "./workspace/describe.ts";

function listed(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1) ?? ""}`;
}

/**
 * The case as the player cracked it, for the debrief (SDD 3.10): stage by
 * stage, the leads they struck off, each claim the archive accepted with the
 * facts that established it, and the transmissions that returned those
 * facts. It comes before the comparison with the reference solution, so the
 * GraphQL lesson reads as a recap of the player's own deduction.
 */
export function DeductionRecap({
  mission,
  state,
}: {
  mission: Mission;
  state: MissionState;
}) {
  const steps = deductionChain(state);
  if (steps.length === 0) return null;
  const leadLabel = (stageId: string, leadId: string) => {
    const stage = mission.stages[stageId];
    if (!stage) return leadId;
    const authored = stage.leads?.[leadId]?.label;
    if (authored) return authored;
    const type = bindingTypes(stage)[leadBinding(stage)];
    return type ? labelOf(refOf(type, leadId), state.ledger) : leadId;
  };
  return (
    <section aria-labelledby="recap-title" data-testid="deduction-recap">
      <h2 id="recap-title">How you cracked it</h2>
      <p>
        This is the case as the archive accepted it. Under each claim on your
        forms are the facts that established it, and the transmission that first
        returned each fact.
      </p>
      {steps.map((step) => {
        const stage = mission.stages[step.stageId];
        const used = [
          ...new Set(
            step.claims.flatMap((c) =>
              c.facts.flatMap((f) =>
                f.transmission === null ? [] : [f.transmission],
              ),
            ),
          ),
        ].sort((a, b) => a - b);
        return (
          <div key={step.stageId} className="recap__stage">
            <h3>{stage?.objective ?? step.stageId}</h3>
            {step.ruledOut.length > 0 && (
              <p>
                You ruled out{" "}
                {listed(step.ruledOut.map((id) => leadLabel(step.stageId, id)))}
                , because facts in your responses contradicted a claim about{" "}
                {step.ruledOut.length === 1 ? "that lead" : "each of them"}.
              </p>
            )}
            <ul className="evidence-chain__claims">
              {step.claims.map(({ claim, facts }) => (
                <li key={claim}>
                  <p className="evidence-chain__prompt">
                    {stage?.claims.find((c) => c.id === claim)?.prompt ?? claim}
                  </p>
                  <ul className="evidence-chain__facts">
                    {facts.map(({ key, transmission }) => {
                      const entry = state.ledger[key];
                      if (!entry) return null;
                      return (
                        <li key={key}>
                          {describeFact(entry.fact, state.ledger)}
                          {transmission !== null && (
                            <span className="label">
                              {" "}
                              · transmission {transmission}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
            {used.length > 0 && (
              <>
                <p>
                  {used.length === 1
                    ? "You retrieved these facts with this transmission:"
                    : "You retrieved these facts with these transmissions:"}
                </p>
                <ol className="compare__list">
                  {used.map((n) => {
                    const t = state.transmissions.find((x) => x.n === n);
                    if (!t) return null;
                    return (
                      <li key={n} value={n}>
                        <pre className="code">{shownOperation(t)}</pre>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
