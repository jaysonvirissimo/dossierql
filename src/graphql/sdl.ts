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
    "One receipt, by its identifier."
    receipt(id: ID!): Receipt @clearance(level: 5)
    "One office, by name."
    office(name: String!): Office @clearance(level: 5)
    "Every travel order on file."
    travelOrders: [TravelOrder!]! @clearance(level: 5)
    "Every payment order on file."
    paymentOrders: [PaymentOrder!]! @clearance(level: 5)
  }

  "A sovereign state."
  type Country {
    "Two-letter country code."
    code: ID!
    "The country's name in English."
    name: String!
    "The name of the capital."
    capital: String
    "The continent the country is counted in."
    continent: Continent
    "Countries that share a land border with this one."
    borders: [Country!]!
    "Languages spoken in the country."
    languages: [Language!]!
    "The currency the country uses."
    currency: Currency
    "Cities in this country that the archive holds a file on."
    cities: [City!]! @inverse(of: "country")
  }

  "A continent, and the countries counted in it."
  type Continent {
    "The continent's name in English."
    name: String!
    "Countries counted in this continent."
    countries: [Country!]! @inverse(of: "continent")
  }

  "A language, and the countries where it is spoken."
  type Language {
    "The language's name in English."
    name: String!
    "Countries where the language is spoken."
    countries: [Country!]! @inverse(of: "languages")
  }

  "A currency, and the countries that use it."
  type Currency {
    "Three-letter currency code."
    code: ID!
    "The currency's name in English."
    name: String!
    "Countries that use the currency."
    countries: [Country!]! @inverse(of: "currency")
  }

  "A city the archive holds a file on, with the shipments through it."
  type City {
    "The city's name in English."
    name: String!
    "The country the city is in."
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
    "The shipment's identifier, as written on its papers."
    id: ID!
    "The goods as the shipper declared them on the shipping papers. Customs takes the declaration as evidence of what a shipment holds."
    manifest: String!
    "The city the shipment left from."
    origin: City!
    "The city the shipment is bound for."
    destination: City!
    "The company that sent the goods."
    shipper: Company
    "The company the shipping papers give as receiving the goods."
    consignee: Company
    "The customs inspection at the port of departure, if one was made. The inspector's finding is evidence of what a shipment holds, and it can tell shipments apart when their papers declare the same goods."
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
    "The inspection report's identifier."
    id: ID!
    "The goods as the inspector described them."
    finding: String!
    "The shipment that was inspected."
    shipment: Shipment @inverse(of: "inspection")
  }

  "A registered company that sends or receives shipments."
  type Company {
    "The company's registered name."
    name: String!
    "The country where the company is registered."
    registeredIn: Country
    "The operative who directs the company."
    director: Operative @clearance(level: 2)
    "The operative who signs off the company's books."
    auditor: Operative @clearance(level: 4)
    "Shipments whose shipping papers give the company as the consignee."
    shipments: [Shipment!]! @inverse(of: "consignee") @clearance(level: 2)
  }

  "The depot's record of a shipment on arrival."
  type IntakeRecord {
    "The intake record's identifier."
    id: ID!
    "The consignee on the label when the shipment arrived."
    consignee: Company
  }

  "The dockside receipt for an unloaded shipment."
  type UnloadingReceipt {
    "The receipt's identifier."
    id: ID!
    "The consignee on the label, as the dockhand copied it."
    labelConsignee: Company
    "The goods as the dockhand described them."
    contents: String
  }

  "An order to hand a shipment to a particular consignee."
  type TransferOrder {
    "The order's identifier."
    id: ID!
    "The company the order hands the shipment to."
    consignee: Company
    "The operative whose signature is on the order."
    authorizedBy: Operative
    "The registry's own log of the signature."
    authorizationLog: AuthorizationLog
    "The office that cleared the order."
    clearedBy: Office @clearance(level: 5)
    "The order's entry in the register of the office that cleared it."
    registerEntry: RegisterEntry @clearance(level: 5)
  }

  "The registry's own record of who signed a transfer order."
  type AuthorizationLog {
    "The log entry's identifier."
    id: ID!
    "The operative who signed, according to the registry."
    signedBy: Operative
  }

  "A person of interest, filed under a codename."
  type Operative {
    "The name the registry files the operative under."
    codename: String!
    "The cover names that the operative is known to travel under."
    coverNames: [CoverName!]! @clearance(level: 2)
    "Reported sightings filed under this operative."
    sightings: [Sighting!]! @inverse(of: "operative") @clearance(level: 2)
    "Companies the operative directs."
    directorships: [Company!]! @inverse(of: "director") @clearance(level: 2)
    "The organization the operative belongs to."
    organization: Organization @clearance(level: 3)
    "Operatives known to work with this one."
    knownAssociates: [Operative!]! @clearance(level: 3)
    "The city where the operative was last seen."
    lastKnownLocation: City @clearance(level: 3)
    "The operative this one reports to."
    handler: Operative @clearance(level: 3)
    "Companies whose books the operative signs off."
    audits: [Company!]! @inverse(of: "auditor") @clearance(level: 4)
  }

  "A name an operative travels under."
  type CoverName @clearance(level: 2) {
    "The cover name, as written."
    name: String!
    "The operative the registry files this name under."
    operative: Operative @inverse(of: "coverNames")
    "Sightings in which someone gave this name."
    sightings: [Sighting!]! @inverse(of: "nameGiven")
  }

  "A report that someone was seen."
  type Sighting @clearance(level: 2) {
    "The report's identifier."
    id: ID!
    "The city where the person was seen."
    city: City!
    "The operative the report was filed under."
    operative: Operative
    "The name the person gave."
    nameGiven: CoverName
    "What the witness reported."
    note: String
  }

  "An organization, and the operatives who belong to it."
  type Organization @clearance(level: 3) {
    "The organization's name."
    name: String!
    "Operatives who belong to the organization."
    members: [Operative!]! @inverse(of: "organization")
  }

  "An office that clears orders and keeps a register of them."
  type Office @clearance(level: 5) {
    "The office's name."
    name: String!
    "The city where the office is."
    city: City
    "The entries in the office's register, in the order they were made."
    register: [RegisterEntry!]! @inverse(of: "office")
  }

  "One numbered entry in an office's register."
  type RegisterEntry @clearance(level: 5) {
    "The entry's serial number. The register numbers its entries in the order they are made, so a lower number was entered earlier."
    serial: Int!
    "The office whose register holds the entry."
    office: Office!
    "What was entered, as the register records it."
    note: String!
    "Who countersigned the entry and filed it."
    countersignedBy: String
  }

  "An order sending an agent from one city to another."
  type TravelOrder @clearance(level: 5) {
    "The order's identifier."
    id: ID!
    "The city the agent travels from."
    from: City!
    "The city the agent travels to."
    to: City!
    "The office that issued the order."
    issuedBy: Office
    "The order's entry in the register of the office that issued it."
    registerEntry: RegisterEntry
  }

  "An order to pay money to a company."
  type PaymentOrder @clearance(level: 5) {
    "The order's identifier."
    id: ID!
    "The company the money is paid to."
    payee: Company
    "The office that cleared the payment."
    clearedBy: Office
    "The order's entry in the register of the office that cleared it."
    registerEntry: RegisterEntry
  }

  "A receipt for goods handed back to their owner."
  type Receipt @clearance(level: 5) {
    "The receipt's identifier."
    id: ID!
    "The shipment the goods travelled in."
    shipment: Shipment
    "The person who signed for the goods on behalf of their owner."
    receivedBy: String
    "The person who signed for handing the goods over."
    releasedBy: String
    "The order under which the goods first left their owner."
    releaseOrder: TransferOrder
    "The register entry for the owner's report that the goods were missing."
    lossReport: RegisterEntry
  }
`;

export const MAX_CLEARANCE = 5;
