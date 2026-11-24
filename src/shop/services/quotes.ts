import type { PackagingSpec, QuoteEstimate, QuoteRequest, QuoteRequestInput } from "../domain";

/**
 * Forespørsler på skreddersydd emballasje, også varianter av tidligere ordre.
 * Ekte implementasjon: adapter mot CRM, der forespørselen blir en sak hos selger.
 */
export interface QuoteService {
  /**
   * Estimert pris og leveringstid på en skreddersydd eske. Uten kunde gir den
   * veiledende pris. Ekte implementasjon: kalkyle i ERP eller et eget kalkylesystem.
   */
  estimate(customerId: string | null, spec: PackagingSpec, quantity: number): Promise<QuoteEstimate>;
  createRequest(customerId: string, input: QuoteRequestInput): Promise<QuoteRequest>;
  /** Nyeste først. */
  listRequests(customerId: string): Promise<QuoteRequest[]>;
  getRequest(customerId: string, id: string): Promise<QuoteRequest | null>;
}
