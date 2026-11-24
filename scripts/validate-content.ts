import { computeBudget } from "../src/engine/clock.ts";
import { validateContent } from "../src/content/validate.ts";
import { loadContent } from "./load-content.ts";

const { raw } = loadContent();
const issues = validateContent(raw);
for (const issue of issues) {
  console.error(`${issue.path}: ${issue.message} [${issue.code}]`);
}
if (issues.length > 0) {
  console.error(`\n${String(issues.length)} content error(s).`);
  process.exitCode = 1;
} else {
  for (const mission of raw.missions) {
    if (!mission.clock) {
      console.log(`${mission.id}: untimed`);
      continue;
    }
    const b = computeBudget(mission, raw.world);
    console.log(
      `${mission.id}: budget ${String(b.total)}h (travel ${String(b.travel)}, ${b.watching > 0 ? `watching ${String(b.watching)}, ` : ""}transmissions ${String(b.transmissions)} x ${String(b.factor)}, hints ${String(b.hintLadder)})`,
    );
  }
  console.log(`${String(raw.missions.length)} mission(s) valid.`);
}
