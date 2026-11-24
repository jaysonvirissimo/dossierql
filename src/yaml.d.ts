declare module "*.yaml" {
  const data: unknown;
  export default data;
}

/** A mission file without its stages and debrief (build/yaml-plugin.ts). */
declare module "*.yaml?summary" {
  const data: unknown;
  export default data;
  /** The fingerprint of the whole mission, stored with saves. */
  export const version: string;
}
