import type { QuoteRequest, QuoteRequestInput } from "../domain";

/**
 * Forespørsler på skreddersydd emballasje, også varianter av tidligere ordre.
 * Ekte implementasjon: adapter mot CRM, der forespørselen blir en sak hos selger.
 */
export interface QuoteService {
  createRequest(customerId: string, input: QuoteRequestInput): Promise<QuoteRequest>;
  /** Nyeste først. */
  listRequests(customerId: string): Promise<QuoteRequest[]>;
  getRequest(customerId: string, id: string): Promise<QuoteRequest | null>;
}
