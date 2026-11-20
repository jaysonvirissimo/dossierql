import { useEffect } from "react";
import { useGame } from "../app/GameProvider.tsx";
import { ConceptCardView } from "../features/ConceptCardView.tsx";
import { Prose } from "../features/Prose.tsx";
import { href } from "./parseRoute.ts";

export function ManualRoute({ entryId }: { entryId?: string | undefined }) {
  const { course, standing } = useGame();

  useEffect(() => {
    if (!entryId) return;
    const target = document.getElementById(`entry-${entryId}`);
    target?.scrollIntoView();
    target?.focus();
  }, [entryId]);

  return (
    <main className="page">
      <article className="paper sheet">
        <div className="sheet__body">
          <p className="label">Reference</p>
          <h1>Tradecraft manual</h1>
          <p>
            The glossary defines every term the game uses and is open from the
            start. Concept cards are earned, one for each case that teaches a
            concept.
          </p>

          <section aria-labelledby="cards-title">
            <h2 id="cards-title">Concept cards</h2>
            <ul className="cards">
              {course.concepts.map((card) =>
                standing.cards.includes(card.id) ? (
                  <li key={card.id}>
                    <ConceptCardView card={card} />
                  </li>
                ) : (
                  <li key={card.id} className="card card--sealed">
                    <p className="label">
                      Concept card · clearance {card.clearance}
                    </p>
                    <h3>{card.title}</h3>
                    <p>
                      Not yet earned. Resolve the teaching case at clearance{" "}
                      {card.clearance}, or pass a later assessment by placement.
                    </p>
                  </li>
                ),
              )}
            </ul>
          </section>

          <section aria-labelledby="glossary-title">
            <h2 id="glossary-title">Glossary</h2>
            <dl className="manual-glossary">
              {[...course.glossary]
                .sort((a, b) => a.term.localeCompare(b.term))
                .map((entry) => (
                  <div
                    key={entry.id}
                    id={`entry-${entry.id}`}
                    tabIndex={-1}
                    className="manual-glossary__entry"
                    data-current={entry.id === entryId}
                  >
                    <dt>
                      <a href={href({ name: "manual", entryId: entry.id })}>
                        {entry.term}
                      </a>
                    </dt>
                    <dd>
                      <Prose text={entry.definition} />
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        </div>
      </article>
    </main>
  );
}
