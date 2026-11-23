import { bindingTypes, leadBinding, type Stage } from "../../content/types.ts";
import { words } from "./describe.ts";

/**
 * A stage's clues. A clue speaks of the record the stage asks for as "the
 * office" or "the shipment", so the list first says which record that is.
 */
export function Clues({ stage }: { stage: Stage }) {
  const type = words(bindingTypes(stage)[leadBinding(stage)] ?? "record");
  return (
    <>
      <p className="clues__lede" data-testid="clues-lede">
        Each clue is a fact about the {type} you are to identify, even where the
        clue says only “the {type}”.
      </p>
      <ul className="clues">
        {stage.clues.map((clue, index) => (
          <li key={index}>{clue.text}</li>
        ))}
      </ul>
    </>
  );
}
