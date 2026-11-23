import {
  getNamedType,
  getNullableType,
  isListType,
  isObjectType,
  type GraphQLObjectType,
} from "graphql";
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
        Every query starts at the first entry below, <code>Query</code>. Write{" "}
        <code>query</code> and a pair of braces, and put one of its fields
        inside the braces. For example,{" "}
        <code>
          query {"{"} city(name: "Lisbon") {"{"} name {"}"} {"}"}
        </code>{" "}
        uses the field <code>city</code> from <code>Query</code>, and asks for
        that city&apos;s <code>name</code>.
      </p>
      <p className="tool__lede">
        How to read an entry. Each line is one field: the field, a colon, and
        what the field returns. For example, <code>capital: String</code> is a
        field called <code>capital</code> that returns text. <code>ID</code> is
        an identifier, such as a shipment's reference number. In a query you
        write an identifier in double quotes, as you write text.{" "}
        <code>[Country!]!</code> means a list of Country records. A field that
        returns a record needs braces after it, with the fields you want from
        that record inside the braces.
      </p>
      <p className="tool__lede">
        The Query entry shows <code>city(name: String!): City</code>. In your
        query, write{" "}
        <code>
          city(name: "Lisbon") {"{"} name {"}"}
        </code>{" "}
        to get Lisbon&apos;s name. In the entry, <code>String!</code> inside the
        parentheses means you must supply text in double quotes. After the colon
        outside the parentheses, <code>City</code> tells you what comes back. If
        the return value has a <code>!</code>, the archive always returns a
        value.{" "}
        {clearance < 5 ? (
          <>
            You never type a <code>!</code> in a query.
          </>
        ) : (
          <>
            Before clearance 5 you never typed a <code>!</code>. Now you type
            one in one place only, which is where a query declares a variable.
            In <code>query Departures($city: String!)</code>, the variable{" "}
            <code>$city</code> fills the <code>name</code> argument of{" "}
            <code>city</code>. That argument is shown here as{" "}
            <code>name: String!</code>, so the declaration copies{" "}
            <code>String!</code> exactly, with its <code>!</code>.
          </>
        )}
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
                  {field.description ?? ""}
                  {!isObjectType(getNamedType(field.type))
                    ? " Holds a single value, so this field takes no braces."
                    : isListType(getNullableType(field.type))
                      ? ` Returns a list of ${String(getNamedType(field.type))} records, so this field needs braces after it. The fields inside the braces come back once for each record in the list.`
                      : ` Returns one ${String(getNamedType(field.type))} record, so this field needs braces after it.`}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
    </div>
  );
}
