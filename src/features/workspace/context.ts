import { createContext, useContext } from "react";
import type { Stage } from "../../content/types.ts";
import type {
  Action,
  Env,
  MissionState,
  Notice,
  Outcome,
  StageState,
} from "../../engine/mission.ts";

export interface WorkspaceValue {
  env: Env;
  state: MissionState;
  stage: Stage;
  stageState: StageState;
  dispatch(action: Action): Outcome;
  notice: Notice | null;
  clearNotice(): void;
  /** The transmission whose response is on screen, or 0 for none. */
  viewing: number;
  view(transmission: number): void;
  restart(): void;
}

export const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function useWorkspace(): WorkspaceValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace needs a Workspace.");
  return value;
}
