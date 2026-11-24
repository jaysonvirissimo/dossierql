import { GraphQLError } from "graphql";
import { bindingTypes, leadBinding, type Stage } from "../content/types.ts";
import type { Actions } from "../graphql/actions.ts";
import type { RawRecord, Store } from "../graphql/store.ts";
import type { ProgressEvent } from "./clearance.ts";

/** The part of the mission engine that paperwork reaches (SDD 4.2). */
export interface Desk<S> {
  store: Store;
  /** The state as the paperwork so far has left it. */
  state: S;
  stage(state: S): Stage;
  filed(state: S): readonly RawRecord[];
  file(state: S, record: RawRecord): S;
  /** Sets one box of the draft for a lead, as the form does. */
  choose(state: S, leadId: string, binding: string, value: string): S;
  /** The leads the player has opened a draft for at the current stage. */
  leads(state: S): string[];
  /** The same engine action as the travel control. */
  proceed(
    state: S,
    leadId: string,
  ): {
    state: S;
    approved: boolean;
    reasons: string[];
    hours: number;
    events: ProgressEvent[];
  };
}

/** Text compared as a player would type it: case and accents aside. */
function plain(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function serial(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

/** A journey's reference, as the record or the player writes it. */
function findJourney(store: Store, wanted: string): RawRecord | undefined {
  return store
    .all("Journey")
    .find(
      (r) =>
        plain(r.id) === plain(wanted) ||
        (typeof r.reference === "string" &&
          plain(r.reference) === plain(wanted)),
    );
}

function findCountry(store: Store, wanted: string): RawRecord | undefined {
  return store
    .all("Country")
    .find(
      (r) =>
        plain(r.id) === plain(wanted) ||
        (typeof r.name === "string" && plain(r.name) === plain(wanted)),
    );
}

/** Text a statement quotes, compared without regard to line breaks. */
function words(text: string): string {
  return plain(text).replace(/\s+/g, " ");
}

function findPremises(store: Store, wanted: string): RawRecord | undefined {
  return store
    .all("Premises")
    .find(
      (r) =>
        plain(r.id) === plain(wanted) ||
        (typeof r.reference === "string" &&
          plain(r.reference) === plain(wanted)),
    );
}

/** The fare as a person writes it: 412.5, not 412.50000001. */
function money(amount: number): string {
  return String(Math.round(amount * 100) / 100);
}

/**
 * The paperwork a transmission files, over a state that each form changes
 * in turn. The forms run in the order the request lists them, so a later
 * form sees what an earlier one did.
 */
export function paperwork<S>(desk: Desk<S>): {
  actions: Actions;
  result(): { state: S; events: ProgressEvent[]; travelled: boolean };
} {
  let state = desk.state;
  const events: ProgressEvent[] = [];
  let travelled = false;
  const count = (type: string) =>
    desk.filed(state).filter((r) => r.type === type).length;

  const actions: Actions = {
    fileExpenseClaim({ journey, amount }) {
      const found = findJourney(desk.store, journey);
      if (!found) {
        throw new GraphQLError(
          `No journey book holds a journey "${journey}". A journey is given by the reference written beside it.`,
        );
      }
      const reference =
        typeof found.reference === "string" ? found.reference : found.id;
      const fare = typeof found.fare === "number" ? found.fare : NaN;
      const voucher = desk.store
        .all("Voucher")
        .find((v) => v.journey === found.id);
      const id = serial("CLM", count("ClaimReceipt") + 1);
      let status: "ALREADY_PAID" | "REFUSED";
      let remark: string;
      if (amount !== fare) {
        status = "REFUSED";
        remark = `The fare for ${reference} is ${money(fare)}, and this claim asks for ${money(amount)}. The accounts office pays a claim only for the fare, and has paid nothing on this one.`;
      } else if (voucher) {
        status = "ALREADY_PAID";
        const ref =
          typeof voucher.reference === "string"
            ? voucher.reference
            : voucher.id;
        remark = `The fare for ${reference} was paid on voucher ${ref}. The accounts office does not pay a fare twice.`;
      } else {
        status = "REFUSED";
        remark = `No fare for ${reference} has been paid. The accounts office pays a fare only to the messenger who made the journey, and has paid nothing on this claim.`;
      }
      const receipt: RawRecord = {
        type: "ClaimReceipt",
        id,
        serial: id,
        journey: found.id,
        amount,
        status,
        remark,
        voucher: status === "ALREADY_PAID" && voucher ? voucher.id : null,
      };
      state = desk.file(state, receipt);
      return receipt;
    },

    fileTravelOrder({ following, to }) {
      const id = serial("TRO", count("TravelReceipt") + 1);
      const receipt = (
        fields: Omit<RawRecord, "type" | "id" | "serial">,
      ): RawRecord => {
        const record: RawRecord = {
          type: "TravelReceipt",
          id,
          serial: id,
          ...fields,
        };
        state = desk.file(state, record);
        return record;
      };
      const country = findCountry(desk.store, to);
      const stage = desk.stage(state);
      if (!country) {
        return receipt({
          approved: false,
          to: null,
          reasons: [
            `The archive holds no country called "${to}". Give a country by its name or its two-letter code.`,
          ],
          hours: 0,
        });
      }
      const lead = leadBinding(stage);
      const types = bindingTypes(stage);
      const destination = Object.keys(stage.solution).find(
        (b) => b !== "type" && b !== lead && types[b] === "Country",
      );
      if (stage.solution.type !== "destination" || !destination) {
        return receipt({
          approved: false,
          to: country.id,
          reasons: [
            "Nothing at this stage of the case calls for a journey. The case asks for a deduction on the draft.",
          ],
          hours: 0,
        });
      }
      const leadId =
        desk.leads(state).find((l) => plain(l) === plain(following)) ??
        following;
      state = desk.choose(state, leadId, destination, country.id);
      const outcome = desk.proceed(state, leadId);
      state = outcome.state;
      events.push(...outcome.events);
      if (outcome.approved) travelled = true;
      return receipt({
        approved: outcome.approved,
        to: country.id,
        reasons: outcome.reasons,
        hours: outcome.hours,
      });
    },

    requestSearchWarrant({ input }) {
      const premises = findPremises(desk.store, input.premises);
      if (!premises) {
        throw new GraphQLError(
          `The police list holds no premises "${input.premises}". Premises are given by the reference the police gave them.`,
        );
      }
      const id = serial("SRW", count("SearchReceipt") + 1);
      const name =
        typeof premises.name === "string" ? premises.name : premises.id;
      const witness =
        typeof premises.witness === "string" ? premises.witness : "";
      const urgency = input.urgency;
      let granted = false;
      let findings: string[] = [];
      let remark: string;
      if (
        premises.statementRequired === true &&
        !words(input.statement ?? "").includes(words(witness))
      ) {
        remark = `The magistrate grants a search of ${name} only on a sworn statement that quotes the witness word for word, and this statement does not. Nothing was searched.`;
      } else if (urgency === "URGENT" && premises.watched !== true) {
        remark = `The magistrate grants an urgent search only of premises that the police watched within the hour, and the police did not watch ${name}. Nothing was searched.`;
      } else if (urgency === "ROUTINE" && premises.watched === true) {
        granted = true;
        remark = `Granted. The police searched ${name} on their morning round. By then the premises had been cleaned and let again, and the police found nothing.`;
      } else {
        granted = true;
        findings = desk.store
          .all("Find")
          .filter((f) => f.foundAt === premises.id)
          .map((f) => f.id);
        remark =
          urgency === "URGENT"
            ? `Granted. The police searched ${name} within the hour.`
            : `Granted. The police searched ${name}.`;
      }
      const receipt: RawRecord = {
        type: "SearchReceipt",
        id,
        serial: id,
        premises: premises.id,
        urgency,
        granted,
        remark,
        findings,
      };
      state = desk.file(state, receipt);
      return receipt;
    },

    requestWarrant({ input }) {
      const id = serial("WRT", count("WarrantReceipt") + 1);
      const receipt = (
        fields: Omit<RawRecord, "type" | "id" | "serial">,
      ): RawRecord => {
        const record: RawRecord = {
          type: "WarrantReceipt",
          id,
          serial: id,
          operative: null,
          company: null,
          hours: 0,
          ...fields,
        };
        state = desk.file(state, record);
        return record;
      };
      const stage = desk.stage(state);
      const { operative, company } = input.subject;
      if (company != null) {
        const found = desk.store
          .all("Company")
          .find(
            (r) =>
              typeof r.name === "string" && plain(r.name) === plain(company),
          );
        return receipt({
          approved: false,
          company: found?.id ?? null,
          reasons: [
            found
              ? "A warrant for a company searches its offices, and this case does not call for a search of a company. A warrant of arrest is for an operative."
              : `The registry holds no company called "${company}". Give a company by its registered name.`,
          ],
        });
      }
      const wanted = operative ?? "";
      const found = desk.store
        .all("Operative")
        .find(
          (r) =>
            plain(r.id) === plain(wanted) ||
            (typeof r.codename === "string" &&
              plain(r.codename) === plain(wanted)),
        );
      if (!found) {
        return receipt({
          approved: false,
          reasons: [
            `The registry holds no operative with the codename "${wanted}". Give an operative by codename.`,
          ],
        });
      }
      if (stage.solution.type !== "warrant") {
        return receipt({
          approved: false,
          operative: found.id,
          reasons: [
            "Nothing at this stage of the case calls for a warrant. The case asks for a form on the draft.",
          ],
        });
      }
      state = desk.choose(state, found.id, leadBinding(stage), found.id);
      const outcome = desk.proceed(state, found.id);
      state = outcome.state;
      events.push(...outcome.events);
      return receipt({
        approved: outcome.approved,
        operative: found.id,
        reasons: outcome.reasons,
        hours: outcome.hours,
      });
    },
  };

  return { actions, result: () => ({ state, events, travelled }) };
}
