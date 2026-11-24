/**
 * The archive's schema. `@clearance` marks the lowest clearance at which a
 * type or field exists; `@inverse` derives a list from the field on the other
 * record that points back; `@undocumented` keeps a type or field out of the
 * documentation panel, so that only introspection describes it (SDD 4). The
 * directives are removed before the schema is served, so players never see
 * them.
 */
export const SDL = /* GraphQL */ `
  directive @clearance(
    level: Int!
  ) on OBJECT | INTERFACE | UNION | ENUM | SCALAR | INPUT_OBJECT | FIELD_DEFINITION
  directive @inverse(of: String!) on FIELD_DEFINITION
  directive @undocumented on OBJECT | UNION | ENUM | SCALAR | INPUT_OBJECT | FIELD_DEFINITION

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
    "Every drawer in the Fourth Desk's cabinet, in the order the desk labelled them."
    cabinet: [Drawer!]! @clearance(level: 6) @undocumented
    "Every slip in the book that Lusaka Exchange Control kept apart from its register."
    exchangeBook: [Slip!]! @clearance(level: 6) @undocumented
    "One case file, by the reference on its cover."
    caseFile(reference: ID!): CaseFile @clearance(level: 7)
    "One intercept log, by the reference on its cover."
    interceptLog(reference: ID!): InterceptLog @clearance(level: 8)
    "One watch book, by the reference on its cover."
    watchBook(reference: ID!): WatchBook @clearance(level: 9)
    "One file of papers, by the reference on its cover."
    paperFile(reference: ID!): PaperFile @clearance(level: 10)
    "One journey book, by the reference on its cover."
    journeyBook(reference: ID!): JourneyBook @clearance(level: 11)
    "One expense claim that you filed, by the serial on its receipt."
    claim(serial: ID!): ClaimReceipt @clearance(level: 11)
    "One premises on the police list, by the reference the police gave it."
    premises(reference: ID!): Premises @clearance(level: 12)
    "One search warrant that you applied for, by the serial on its receipt."
    search(serial: ID!): SearchReceipt @clearance(level: 12)
  }

  "The paperwork you can file with the archive. Each field files one form and returns the receipt for it. When a request files several forms, the archive files them one at a time, in the order the request lists them."
  type Mutation @clearance(level: 11) {
    "Files an expense claim for the fare of one journey in a journey book. The accounts office pays a fare once, and only for the amount of the fare. The receipt says whether the fare was already paid, and if it was, gives the voucher it was paid on."
    fileExpenseClaim(journey: ID!, amount: Float!): ClaimReceipt
    "Files the travel order on your draft for one lead. following is the reference of the record that you choose first on the travel order, such as a journey or a find, and to is the country the order sends you to, by its name or its two-letter code. The receipt says whether the order was approved, and why not when it was not."
    fileTravelOrder(following: ID!, to: String!): TravelReceipt
    "Applies to the magistrate for a search warrant on one premises. When the magistrate grants the warrant, the police search the premises, and the receipt lists what they found. The argument input is the application form, with a box for each of its fields."
    requestSearchWarrant(input: SearchApplication!): SearchReceipt
      @clearance(level: 12)
    "Applies to the magistrate for a warrant. The archive checks a warrant of arrest against every response you have received, as it checks a form. A warrant that is submitted and not approved costs hours, and its receipt says why it was not approved."
    requestWarrant(input: WarrantApplication!): WarrantReceipt
      @clearance(level: 12)
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
    "Premises in this city that are on the police list."
    premises: [Premises!]! @inverse(of: "city") @clearance(level: 12)
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
    "Vessels the company hired for a voyage. The company that hires a vessel need not be the company that owns it."
    charters: [Vessel!]! @inverse(of: "charteredBy") @clearance(level: 8)
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
    "A separate registry record of who signed the order."
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
    "A habit the operative is known for, as the registry wrote it down."
    habit: String @clearance(level: 12)
    "A weakness the operative is known for, as the registry wrote it down."
    weakness: String @clearance(level: 12)
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
    "The vessel the person came ashore from, if the watcher saw one."
    vessel: Vessel @clearance(level: 8)
    "The pass the person showed at a door, if the watcher saw one."
    pass: Pass @clearance(level: 8)
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
    "The officers who work at the office."
    officers: [Officer!]! @inverse(of: "office") @clearance(level: 7)
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

  "A serial in a register, written as the letters of the office that keeps the register, a hyphen, and the number of the entry. FD-4126 is entry 4126 in the register of the Fourth Desk, and FS-0088 is entry 88 in the register of the First Desk."
  scalar DeskSerial @clearance(level: 6) @undocumented

  "One drawer of the Fourth Desk's cabinet."
  type Drawer @clearance(level: 6) @undocumented {
    "The label on the front of the drawer."
    label: String!
    "The dockets filed in the drawer."
    dockets: [Docket!]! @inverse(of: "drawer")
  }

  "A docket: the folder the Fourth Desk kept for one matter, with every paper on the matter inside it."
  type Docket @clearance(level: 6) @undocumented {
    "The reference written on the docket's cover."
    reference: ID!
    "The matter, as the desk wrote it on the cover."
    title: String!
    "The drawer the docket is filed in."
    drawer: Drawer!
    "The consignment the matter concerns, if it concerns one."
    shipment: Shipment
    "The office that wrote the minute. A minute is the instruction that a docket is opened on."
    minute: Office
    "The office the docket is marked for. That office must carry out the minute. It did not write the minute."
    mark: Office
    "Every office that was sent a copy of the minute."
    circulation: [Office!]!
    "The entry for the minute, in the register of the office that wrote the minute."
    opened: DeskSerial!
    "The party the docket's papers are held for."
    heldFor: Operative
  }

  "A slip in the book of Lusaka Exchange Control: a payment the exchange let through without entering it in its register."
  type Slip @clearance(level: 6) @undocumented {
    "The number on the slip."
    number: ID!
    "The company the money was paid to."
    payee: Company
    "The amount, as written on the slip."
    amount: String!
    "The serial of the entry that allowed the payment, in the register of the office that allowed it."
    authority: DeskSerial
    "Every office the slip passed through, in order."
    route: [Office!]!
    "The party who carried the money across."
    courier: Operative
    "The party who sent the slip to the exchange. That party did not carry the money."
    sender: Operative
  }

  "A case file: the papers an office keeps together on one matter. The documents in it are of several kinds."
  type CaseFile @clearance(level: 7) {
    "The reference on the file's cover."
    reference: ID!
    "The matter, as written on the cover."
    title: String!
    "The documents in the file that were filed in the city given, or in any city if none is given. Without the argument sealed, or with sealed: false, only the open documents are listed. With sealed: true, only the sealed documents are listed, and the open ones are left out."
    documents(city: String, sealed: Boolean = false): [Document!]!
  }

  "A document in a case file. Every kind of document carries the same filing stamp: the fields listed here. A telegram, a memorandum, and a minute each have fields of their own as well."
  interface Document @clearance(level: 7) {
    "The reference written on the document."
    reference: ID!
    "What the document is, as the filing clerk wrote it on the stamp."
    title: String!
    "The serial the document was filed under, in the register of the office that filed it, such as FS-0088."
    stamp: String!
    "The city where the document was filed. An office files a telegram it receives in its own city."
    city: City!
    "Whether the document is under seal."
    sealed: Boolean!
  }

  "A telegram: a short message sent by wire from one office to another."
  type Telegram implements Document @clearance(level: 7) {
    "The reference written on the document."
    reference: ID!
    "What the document is, as the filing clerk wrote it on the stamp."
    title: String!
    "The serial the document was filed under, in the register of the office that filed it, such as FS-0088."
    stamp: String!
    "The city where the document was filed. An office files a telegram it receives in its own city."
    city: City!
    "Whether the document is under seal."
    sealed: Boolean!
    "The words of the telegram."
    text: String!
    "The office that sent the telegram."
    origin: Office
  }

  "A memorandum: a note that one officer wrote and signed."
  type Memorandum implements Document @clearance(level: 7) {
    "The reference written on the document."
    reference: ID!
    "What the document is, as the filing clerk wrote it on the stamp."
    title: String!
    "The serial the document was filed under, in the register of the office that filed it, such as FS-0088."
    stamp: String!
    "The city where the document was filed. An office files a telegram it receives in its own city."
    city: City!
    "Whether the document is under seal."
    sealed: Boolean!
    "The officer who wrote and signed the memorandum."
    author: Officer
    "The words of the memorandum."
    body: String!
  }

  "A minute: a written instruction from one office to another."
  type Minute implements Document @clearance(level: 7) {
    "The reference written on the document."
    reference: ID!
    "What the document is, as the filing clerk wrote it on the stamp."
    title: String!
    "The serial the document was filed under, in the register of the office that filed it, such as FS-0088."
    stamp: String!
    "The city where the document was filed. An office files a telegram it receives in its own city."
    city: City!
    "Whether the document is under seal."
    sealed: Boolean!
    "The office the minute instructs."
    addressedTo: Office
    "The instruction, as the minute words it."
    instruction: String!
    "The initials at the foot of the minute. They are the initials of the officer who drafted it."
    initials: String
  }

  "An officer of the agency."
  type Officer @clearance(level: 7) {
    "The officer's name."
    name: String!
    "The officer's post at the office."
    post: String!
    "The officer's initials, as the officer writes them."
    initials: String!
    "The office where the officer works."
    office: Office
  }

  "An intercept log: what one of the agency's listening posts heard and saw, entry by entry."
  type InterceptLog @clearance(level: 8) {
    "The reference on the log's cover."
    reference: ID!
    "The post and the hours that the log covers, as written on its cover."
    title: String!
    "The entries in the log, in the order the post made them. Each entry is a vessel, a company, a sighting, a telegram, or a pass. With kind, only the entries of that kind are listed. With kinds, only the entries of the kinds in the list are listed."
    entries(kind: InterceptKind, kinds: [InterceptKind!]): [Intercept!]!
  }

  "One entry in an intercept log. An entry is a Vessel, a Company, a Sighting, a Telegram, or a Pass. Intercept lists no fields of its own, even where two kinds have a field of the same name."
  union Intercept @clearance(level: 8) =
    | Vessel
    | Company
    | Sighting
    | Telegram
    | Pass

  "The kinds of entry in an intercept log."
  enum InterceptKind @clearance(level: 8) {
    "A vessel that the post heard on the harbour radio."
    VESSEL
    "A company whose business the post overheard."
    COMPANY
    "A sighting that one of the post's watchers reported."
    SIGHTING
    "A telegram that the post copied off the wire."
    TELEGRAM
    "A pass that the post copied at a door."
    PASS
  }

  "A vessel, as the listening post heard it on the harbour radio."
  type Vessel @clearance(level: 8) {
    "The vessel's name, as painted on its bow."
    name: String!
    "The country whose flag the vessel flies."
    flag: Country
    "The city of the port the vessel last sailed from."
    lastPort: City
    "The company that owns the vessel."
    owner: Company
    "The company that hired the vessel for its voyage. A vessel sailing for its owner has none."
    charteredBy: Company
    "What the vessel reported on the harbour radio."
    report: String!
  }

  "A pass that admits its holder to the agency's building in Lisbon."
  type Pass @clearance(level: 8) {
    "The number printed on the pass."
    number: ID!
    "The name written on the pass, as the holder gave it."
    holder: String!
    "The office that issued the pass."
    issuedBy: Office
    "The officer who signed the pass for the office that issued it. Empty when nobody signed it."
    signedBy: Officer
  }

  "A watch book: the entries that the agency's watchers wrote, one after another, at one post inside the agency's building in Lisbon."
  type WatchBook @clearance(level: 9) {
    "The reference on the book's cover."
    reference: ID!
    "The post and the hours that the book covers, as written on its cover."
    title: String!
    "One page of the book's entries, in the order the watchers wrote them. With first: 10, the page holds the first ten entries. With after, the page starts at the entry after the one whose reference you give, such as the endCursor of the page before. Without first, the page holds every entry to the end of the book. The records clerk weighs a page by its page size: one for each entry, and one more for each record you open inside an entry."
    entries(first: Int, after: String): WatchPage!
  }

  "One page of a watch book."
  type WatchPage @clearance(level: 9) {
    "The entries on the page. The list is null when the page holds an entry that is classified above your clearance, because an entry in this list may not be null."
    nodes: [WatchEntry!]
    "Where the page ends, and whether the book goes on after it."
    pageInfo: PageInfo!
  }

  "Where a page ends."
  type PageInfo @clearance(level: 9) {
    "Whether the book has more entries after this page."
    hasNextPage: Boolean!
    "The reference of the last entry on the page. Give it as the argument after to start the next page there. Null when the page holds no entries."
    endCursor: String
  }

  "One entry in a watch book."
  type WatchEntry @clearance(level: 9) {
    "The reference written beside the entry. It is also the entry's cursor."
    reference: ID!
    "The hour the watcher wrote beside the entry, on the twenty-four-hour clock."
    hour: String!
    "What the watcher saw, in the watcher's words."
    note: String!
    "The operative the entry is about, when the watcher recognised one."
    operative: Operative
    "The officer of the agency the entry is about, when there is one."
    officer: Officer
    "The pass the entry records, when someone showed one."
    pass: Pass
  }

  "A file of papers: every paper that one office filed, in the order it filed them."
  type PaperFile @clearance(level: 10) {
    "The reference on the file's cover."
    reference: ID!
    "The office and the papers that the file holds, as written on its cover."
    title: String!
    "One page of the file's papers, in the order they were filed. first and after work as they do on a watch book's entries. The records clerk weighs a page by its page size: one for each paper, and one more for each record you open inside a paper. Without first, the clerk counts the page as the longest file of papers in the archive, which holds 120."
    papers(first: Int, after: String): PaperPage!
  }

  "One page of a file of papers."
  type PaperPage @clearance(level: 10) {
    "The papers on the page."
    nodes: [Paper!]
    "Where the page ends, and whether the file goes on after it."
    pageInfo: PageInfo!
  }

  "A paper in a file: a letter, a request, or an instruction, with the minute sheet pinned to it."
  type Paper @clearance(level: 10) {
    "The reference written on the paper. It is also the paper's cursor."
    reference: ID!
    "The hour the paper was filed, on the twenty-four-hour clock. Empty when the file does not record the hour."
    hour: String
    "What the paper is about, as the office wrote it on the file's list of papers."
    subject: String!
    "The office the paper came from. Empty when the paper does not say."
    from: Office
    "The minute sheet: every endorsement that an officer wrote on the paper, in the order they were written. Each endorsement on it is a record. The longest minute sheet in the archive holds ten endorsements, and the records clerk counts every minute sheet that you ask for as ten."
    minuteSheet: [Endorsement!]!
    "The papers pinned to this one. Each enclosure is a paper with a minute sheet of its own."
    enclosures: [Paper!]!
  }

  "One endorsement on a minute sheet: a remark that an officer wrote on a paper, and initialled."
  type Endorsement @clearance(level: 10) {
    "The reference that the registry wrote beside the endorsement."
    reference: ID!
    "The remark, in the words of the officer who wrote it."
    remark: String!
    "The officer who wrote the endorsement. Empty when nobody can read the initials."
    officer: Officer
  }

  "A journey book: the journeys that an office's messengers made, in the order they made them."
  type JourneyBook @clearance(level: 11) {
    "The reference on the book's cover."
    reference: ID!
    "The office and the days that the book covers, as written on its cover."
    title: String!
    "The journeys in the book, in the order they were made."
    journeys: [Journey!]!
  }

  "One journey in a journey book, as the messenger wrote it down."
  type Journey @clearance(level: 11) {
    "The reference written beside the journey."
    reference: ID!
    "The messenger who made the journey."
    messenger: Officer
    "Where the journey started, in the messenger's words."
    from: String!
    "Where the journey ended, in the messenger's words."
    to: String!
    "The fare, as the messenger wrote it in the book."
    fare: Float!
    "The account that the messenger asked for the fare to be charged to. The accounts office decides which account pays."
    chargedTo: Account
  }

  "An account that the accounts office pays fares from."
  type Account @clearance(level: 11) {
    "The reference of the account."
    reference: ID!
    "The account's name in the accounts office's books."
    name: String!
    "The office that the account belongs to."
    office: Office
  }

  "A voucher: the accounts office's record of a fare it paid."
  type Voucher @clearance(level: 11) {
    "The reference of the voucher."
    reference: ID!
    "The journey whose fare the voucher paid."
    journey: Journey!
    "The amount paid."
    amount: Float!
    "The city where the journey ended, as the accounts office recorded it."
    to: City
    "The officer the fare was paid to."
    paidTo: Officer
    "The account the fare was paid from."
    paidFrom: Account!
    "The officer who authorised the payment."
    authorisedBy: Officer
    "The officer who countersigned the voucher. When a messenger carries a paper, the accounts office pays the fare only after the officer who took the paper from the messenger has countersigned. Empty when nobody countersigned."
    countersignedBy: Officer
    "The accounts office's remark on the voucher."
    remark: String!
  }

  "What the accounts office did with an expense claim."
  enum ClaimStatus @clearance(level: 11) {
    "The fare was paid before, on the voucher that the receipt gives."
    ALREADY_PAID
    "The claim was not paid. The receipt's remark says why."
    REFUSED
  }

  "The receipt for an expense claim that you filed."
  type ClaimReceipt @clearance(level: 11) {
    "The receipt's serial. The accounts office numbers receipts in the order it files the claims, so a lower number was filed earlier."
    serial: ID!
    "The journey that the claim was for."
    journey: Journey!
    "The amount that the claim asked for."
    amount: Float!
    "What the accounts office did with the claim."
    status: ClaimStatus!
    "The accounts office's remark on the claim."
    remark: String!
    "The voucher that the fare was already paid on. Empty when the claim was refused."
    voucher: Voucher
  }

  "The receipt for a travel order that you filed."
  type TravelReceipt @clearance(level: 11) {
    "The receipt's serial."
    serial: ID!
    "Whether the order was approved. An approved order sends you on the journey."
    approved: Boolean!
    "The country that the order sends you to. Empty when the archive found no country by that name or code."
    to: Country
    "Why the order was not approved. Empty when it was."
    reasons: [String!]!
    "The hours that the journey took from the mission clock."
    hours: Int!
  }

  "How soon the police are to search premises."
  enum Urgency @clearance(level: 12) {
    "The police search the premises the next morning. A routine search of premises that the police watched within the hour comes too late, and finds nothing."
    ROUTINE
    "The police search the premises within the hour. The magistrate grants an urgent search only of premises that the police watched within the hour."
    URGENT
  }

  "The application form for a search warrant."
  input SearchApplication @clearance(level: 12) {
    "The reference of the premises to be searched, as the police list gives it."
    premises: ID!
    "Your sworn statement of why the premises should be searched. Some magistrates grant a search only on a statement that quotes the witness word for word. When the witness's words hold quotation marks, write the statement as a block string: three quotation marks, the words, and three more quotation marks. The glossary entry for a block string shows an example."
    statement: String
    "How soon the police are to search. Leave it out for a routine search."
    urgency: Urgency = ROUTINE
  }

  "Who a warrant is for. Fill exactly one of the two boxes: a warrant is for an operative or for a company, never for both."
  input WarrantSubject @oneOf @clearance(level: 12) {
    "The codename of the operative to be arrested."
    operative: ID
    "The registered name of the company whose offices are to be searched."
    company: ID
  }

  "The application form for a warrant."
  input WarrantApplication @clearance(level: 12) {
    "Who the warrant is for."
    subject: WarrantSubject!
    "Your sworn statement of why the warrant should be granted."
    statement: String
  }

  "Premises on the police list: a room, a shop, or an office that the police can search with a warrant."
  type Premises @clearance(level: 12) {
    "The reference the police gave the premises."
    reference: ID!
    "The name of the premises."
    name: String!
    "What kind of premises they are."
    kind: String!
    "The city the premises are in."
    city: City!
    "What a witness at the premises told the police, word for word."
    witness: String
    "Whether the magistrate grants a search of the premises only on a sworn statement that quotes the witness word for word."
    statementRequired: Boolean!
    "Whether the police watched the premises within the hour. The magistrate grants an urgent search only of premises that the police watched within the hour."
    watched: Boolean!
  }

  "Something the police found when they searched premises."
  type Find @clearance(level: 12) {
    "The reference the police gave the find."
    reference: ID!
    "What the police found, in their words."
    description: String!
    "The premises where the police found it."
    foundAt: Premises!
    "The name that the guest who left it gave the premises. Empty when nobody knows who left it."
    leftBy: CoverName
    "The currency of the money in the find. Empty when the find holds no money."
    currency: Currency
    "The language the find is written in. Empty when nothing is written on it."
    language: Language
    "The city that the find shows a journey to, such as the city on a ticket. Empty when it shows none."
    city: City
  }

  "The receipt for a search warrant that you applied for."
  type SearchReceipt @clearance(level: 12) {
    "The receipt's serial. The magistrate numbers applications in the order they were made."
    serial: ID!
    "The premises the application was for."
    premises: Premises!
    "How soon the application asked the police to search."
    urgency: Urgency!
    "Whether the magistrate granted the warrant."
    granted: Boolean!
    "The magistrate's remark on the application."
    remark: String!
    "What the police found. Empty when the magistrate refused the warrant or the police found nothing."
    findings: [Find!]!
  }

  "The receipt for a warrant that you applied for."
  type WarrantReceipt @clearance(level: 12) {
    "The receipt's serial."
    serial: ID!
    "Whether the warrant was approved."
    approved: Boolean!
    "The operative the warrant was for. Empty when it was for a company."
    operative: Operative
    "The company the warrant was for. Empty when it was for an operative."
    company: Company
    "Why the warrant was not approved. Empty when it was."
    reasons: [String!]!
    "The hours that the application took from the mission clock."
    hours: Int!
  }
`;

export const MAX_CLEARANCE = 12;
