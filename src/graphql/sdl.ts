/**
 * The archive's schema. `@clearance` marks the lowest clearance at which a
 * type or field exists; `@inverse` derives a list from the field on the other
 * record that points back. Both directives are removed before the schema is
 * served, so players never see them.
 */
export const SDL = /* GraphQL */ `
  directive @clearance(level: Int!) on OBJECT | FIELD_DEFINITION
  directive @inverse(of: String!) on FIELD_DEFINITION

  type Query {
    "One city, by name."
    city(name: String!): City
    "Every city the archive holds a file on."
    cities: [City!]!
    "One country, by name or by its two-letter code."
    country(name: String, code: ID): Country
    "Every sovereign state."
    countries: [Country!]!
    "One shipment, by its identifier."
    shipment(id: ID!): Shipment
    "One operative's file, by codename."
    operative(codename: String!): Operative @clearance(level: 2)
    "The whole registry of operatives."
    operatives: [Operative!]! @clearance(level: 2)
    "One cover name, as written."
    coverName(name: String!): CoverName @clearance(level: 2)
    "One company, by its registered name."
    company(name: String!): Company @clearance(level: 2)
    "One organization, by name."
    organization(name: String!): Organization @clearance(level: 3)
  }

  "A sovereign state."
  type Country {
    "Two-letter country code."
    code: ID!
    name: String!
    "The name of the capital."
    capital: String
    continent: Continent
    "Countries that share a land border with this one."
    borders: [Country!]!
    languages: [Language!]!
    currency: Currency
    "Cities in this country that the archive holds a file on."
    cities: [City!]! @inverse(of: "country")
  }

  type Continent {
    name: String!
    countries: [Country!]! @inverse(of: "continent")
  }

  type Language {
    name: String!
    "Countries where the language is spoken."
    countries: [Country!]! @inverse(of: "languages")
  }

  type Currency {
    "Three-letter currency code."
    code: ID!
    name: String!
    "Countries that use the currency."
    countries: [Country!]! @inverse(of: "currency")
  }

  type City {
    name: String!
    country: Country!
    "Shipments that left this city."
    departingShipments: [Shipment!]! @inverse(of: "origin")
    "Shipments bound for this city."
    arrivingShipments: [Shipment!]! @inverse(of: "destination")
    "Reported sightings of operatives in this city."
    sightings: [Sighting!]! @inverse(of: "city") @clearance(level: 2)
  }

  "A consignment moving between two cities."
  type Shipment {
    id: ID!
    "The goods as the shipper declared them."
    manifest: String!
    origin: City!
    destination: City!
    "The company that sent the goods."
    shipper: Company
    "The company named to receive the goods."
    consignee: Company
    "The customs inspection at the port of departure, if one was made."
    inspection: Inspection
    "The depot's record of the shipment on arrival."
    intake: IntakeRecord
    "The dockside receipt written when the shipment was unloaded."
    unloadingReceipt: UnloadingReceipt
    "Orders to hand the shipment to another party."
    transferOrders: [TransferOrder!]!
  }

  "What a customs inspector found on opening a shipment."
  type Inspection {
    id: ID!
    "The goods as the inspector described them."
    finding: String!
    shipment: Shipment @inverse(of: "inspection")
  }

  type Company {
    name: String!
    registeredIn: Country
    director: Operative @clearance(level: 2)
    "The operative who signs off the company's books."
    auditor: Operative @clearance(level: 4)
    "Shipments consigned to the company."
    shipments: [Shipment!]! @inverse(of: "consignee") @clearance(level: 2)
  }

  "The depot's record of a shipment on arrival."
  type IntakeRecord {
    id: ID!
    "The consignee on the label when the shipment arrived."
    consignee: Company
  }

  "The dockside receipt for an unloaded shipment."
  type UnloadingReceipt {
    id: ID!
    "The consignee on the label, as the dockhand copied it."
    labelConsignee: Company
    "The goods as the dockhand described them."
    contents: String
  }

  "An order to hand a shipment to a named consignee."
  type TransferOrder {
    id: ID!
    consignee: Company
    "The operative whose signature is on the order."
    authorizedBy: Operative
    "The registry's own log of the signature."
    authorizationLog: AuthorizationLog
  }

  type AuthorizationLog {
    id: ID!
    signedBy: Operative
  }

  "A person of interest, filed under a codename."
  type Operative {
    codename: String!
    "Names the operative is known to travel under."
    coverNames: [CoverName!]! @clearance(level: 2)
    sightings: [Sighting!]! @inverse(of: "operative") @clearance(level: 2)
    "Companies the operative directs."
    directorships: [Company!]! @inverse(of: "director") @clearance(level: 2)
    organization: Organization @clearance(level: 3)
    knownAssociates: [Operative!]! @clearance(level: 3)
    lastKnownLocation: City @clearance(level: 3)
    "The operative this one reports to."
    handler: Operative @clearance(level: 3)
    "Companies whose books the operative signs off."
    audits: [Company!]! @inverse(of: "auditor") @clearance(level: 4)
  }

  "A name an operative travels under."
  type CoverName @clearance(level: 2) {
    name: String!
    "The operative the registry files this name under."
    operative: Operative @inverse(of: "coverNames")
    "Sightings in which someone gave this name."
    sightings: [Sighting!]! @inverse(of: "nameGiven")
  }

  "A report that someone was seen."
  type Sighting @clearance(level: 2) {
    id: ID!
    city: City!
    "The operative the report was filed under."
    operative: Operative
    "The name the person gave."
    nameGiven: CoverName
    "What the witness reported."
    note: String
  }

  type Organization @clearance(level: 3) {
    name: String!
    members: [Operative!]! @inverse(of: "organization")
  }
`;

export const MAX_CLEARANCE = 5;
