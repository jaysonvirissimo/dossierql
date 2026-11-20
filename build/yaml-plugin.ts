import type { Plugin } from "vite";
import { parse } from "yaml";

/**
 * Turns YAML files into JSON modules at build time, so mission content is
 * authored as YAML and no YAML parser ships to the browser.
 */
export function yamlContent(): Plugin {
  return {
    name: "dossierql-yaml",
    transform(code, id) {
      if (!/\.ya?ml$/.test(id)) return null;
      const data: unknown = parse(code);
      return {
        code: `export default ${JSON.stringify(data)};`,
        map: null,
      };
    },
  };
}
