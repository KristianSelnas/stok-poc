import type { Customer } from "../domain";

/**
 * Kunder med adresser, brukere og prisavtale.
 * Ekte implementasjon: adapter mot CRM. `listCustomers` brukes bare av
 * demoinnloggingen og forsvinner med ekte innlogging.
 */
export interface CustomerService {
  getCustomer(id: string): Promise<Customer | null>;
  listCustomers(): Promise<Customer[]>;
}
