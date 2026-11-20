import { getNamedType, isObjectType, type GraphQLObjectType } from "graphql";
import { useMemo } from "react";
import { schemaFor } from "../graphql/schema.ts";

/**
 * The archive as it describes itself at one clearance. Read from the schema,
 * so it always agrees with what a query may ask for.
 */
export function SchemaDocs({ clearance }: { clearance: number }) {
  const types = useMemo(() => {
    const schema = schemaFor(clearance);
    const query = schema.getQueryType();
    const all = Object.values(schema.getTypeMap()).filter(
      (t): t is GraphQLObjectType =>
        isObjectType(t) && !t.name.startsWith("__") && t !== query,
    );
    all.sort((a, b) => a.name.localeCompare(b.name));
    return query ? [query, ...all] : all;
  }, [clearance]);
  return (
    <div className="tool">
      <p className="tool__lede">
        Everything the archive holds at clearance {clearance}. Reading the
        documentation costs no time.
      </p>
      <p className="tool__lede">
        How to read an entry. Each line is one field: the field, a colon, and
        what the field returns. For example, <code>capital: String</code> is a
        field called <code>capital</code> that returns text. <code>ID</code> is
        an identifier, such as a shipment's reference number.{" "}
        <code>[Country!]!</code> means a list of Country records. A field that
        returns a record needs braces after it, with the fields you want from
        that record inside the braces.
      </p>
      <p className="tool__lede">
        Some fields have a part in parentheses, which says which record you
        want. For example, <code>city(name: String!): City</code> means: give
        the name of a city, as text in double quotes, and you get back one City
        record. Inside parentheses, a <code>!</code> means that you must give
        that value. Anywhere else, a <code>!</code> means only that the value is
        never missing, and you can ignore it. You never type a <code>!</code> in
        a query.
      </p>
      {types.map((type, index) => (
        <details
          key={type.name}
          className="doc"
          ref={(element) => {
            // Opened once, then left as the player sets it.
            if (element && index === 0 && !element.dataset.opened) {
              element.dataset.opened = "yes";
              element.open = true;
            }
          }}
        >
          <summary>
            <code>{type.name}</code>
            {index === 0 && <span> · where every query starts</span>}
            {type.description && <span> · {type.description}</span>}
          </summary>
          <dl className="doc__fields">
            {Object.values(type.getFields()).map((field) => (
              <div key={field.name} className="doc__field">
                <dt>
                  <code>
                    {field.name}
                    {field.args.length > 0 &&
                      `(${field.args
                        .map((a) => `${a.name}: ${String(a.type)}`)
                        .join(", ")})`}
                    : {String(field.type)}
                  </code>
                </dt>
                <dd>
                  {field.description ??
                    (isObjectType(getNamedType(field.type))
                      ? ""
                      : "A single value, not a record.")}
                  {isObjectType(getNamedType(field.type)) &&
                    ` Returns ${String(getNamedType(field.type))}, which is a record, so this field needs braces after it.`}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
    </div>
  );
}
