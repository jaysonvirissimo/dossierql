import {
  getNamedType,
  getNullableType,
  isAbstractType,
  isInterfaceType,
  isListType,
  isObjectType,
  print,
  type GraphQLArgument,
  type GraphQLInterfaceType,
  type GraphQLObjectType,
  type GraphQLSchema,
} from "graphql";
import { useMemo } from "react";
import { isUndocumented, schemaFor } from "../graphql/schema.ts";

/**
 * The archive as it describes itself at one clearance. Read from the schema,
 * so it always agrees with what a query may ask for.
 */
/** An argument as the entry shows it, with its default value if it has one. */
function argumentText(argument: GraphQLArgument): string {
  const text = `${argument.name}: ${String(argument.type)}`;
  const value = argument.astNode?.defaultValue;
  return value ? `${text} = ${print(value)}` : text;
}

/** The kinds of record that an interface stands for, as a phrase. */
/**
 * An inline fragment for the first kind of an interface, asking for one
 * field that only that kind has, as in `... on Telegram { text }`.
 */
function exampleFragment(
  schema: GraphQLSchema,
  type: GraphQLInterfaceType,
): string {
  const [kind] = schema.getPossibleTypes(type);
  if (!kind) return "";
  const shared = new Set(Object.keys(type.getFields()));
  const own = Object.values(kind.getFields()).find(
    (field) =>
      !shared.has(field.name) &&
      !isObjectType(getNamedType(field.type)) &&
      !isAbstractType(getNamedType(field.type)),
  );
  return own ? `... on ${kind.name} { ${own.name} }` : "";
}

function kindsOf(schema: GraphQLSchema, type: GraphQLInterfaceType): string {
  const names = schema.getPossibleTypes(type).map((kind) => kind.name);
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} or ${names[names.length - 1] ?? ""}`;
}

export function SchemaDocs({ clearance }: { clearance: number }) {
  const schema = schemaFor(clearance);
  const types = useMemo(() => {
    const query = schema.getQueryType();
    const all = Object.values(schema.getTypeMap()).filter(
      (t): t is GraphQLObjectType | GraphQLInterfaceType =>
        (isObjectType(t) || isInterfaceType(t)) &&
        !t.name.startsWith("__") &&
        t !== query &&
        !isUndocumented(t.name),
    );
    all.sort((a, b) => a.name.localeCompare(b.name));
    return query ? [query, ...all] : all;
  }, [schema]);
  const seized = types.some((type) =>
    Object.keys(type.getFields()).some((field) =>
      isUndocumented(type.name, field),
    ),
  );
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
        to get Lisbon&apos;s name. In the entry, <code>String</code> inside the
        parentheses means that the value you give for <code>name</code> is text,
        which you write in double quotes. The <code>!</code> after{" "}
        <code>String</code> means that you must give that value. After the colon
        outside the parentheses, <code>City</code> tells you what kind of record
        comes back. When an entry shows a <code>!</code> after what comes back,
        as in <code>name: String!</code>, the archive always returns a value.
        Without one, the archive returns <code>null</code> when it has nothing
        to give.{" "}
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
      {seized && (
        <p className="tool__lede" data-testid="undocumented">
          Not everything the archive holds at clearance {clearance} is in this
          documentation. Records seized from outside the agency&apos;s registry
          are in the archive, but nobody at the agency has written documentation
          for them, so they are not listed here. The archive can still describe
          them to you. The glossary entry for introspection explains how to ask.
        </p>
      )}
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
            {isInterfaceType(type) && (
              <span>
                {" "}
                · An interface. Each record is a {kindsOf(schema, type)}, and
                has the fields below. Ask for a field that only one kind has
                inside an inline fragment for that kind, as in{" "}
                <code>{exampleFragment(schema, type)}</code>.
              </span>
            )}
            {isObjectType(type) && type.getInterfaces().length > 0 && (
              <span>
                {" "}
                · Has every field of{" "}
                {type
                  .getInterfaces()
                  .map((i) => i.name)
                  .join(" and ")}
                , and the fields after them.
              </span>
            )}
          </summary>
          <dl className="doc__fields">
            {Object.values(type.getFields())
              .filter((field) => !isUndocumented(type.name, field.name))
              .map((field) => (
                <div key={field.name} className="doc__field">
                  <dt>
                    <code>
                      {field.name}
                      {field.args.length > 0 &&
                        `(${field.args.map(argumentText).join(", ")})`}
                      : {String(field.type)}
                    </code>
                  </dt>
                  <dd>
                    {field.description ?? ""}
                    {!isObjectType(getNamedType(field.type)) &&
                    !isAbstractType(getNamedType(field.type))
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
