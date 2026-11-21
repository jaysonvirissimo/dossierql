import type { ConceptCard } from "../content/types.ts";
import { Prose } from "./Prose.tsx";

export function ConceptCardView({ card }: { card: ConceptCard }) {
  return (
    <article className="card">
      <p className="label">Concept card · clearance {card.clearance}</p>
      <h3>{card.title}</h3>
      <Prose text={card.summary} />
      <pre className="code">{card.example.trim()}</pre>
      <p className="card__payoff">{card.payoff}</p>
    </article>
  );
}
