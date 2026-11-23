import { notFound } from "next/navigation";

/**
 * Fanger opp stier som ikke har en side ennå, og viser 404 med riktig layout.
 * Erstattes av en generisk side-rute som henter innhold fra Sanity i fase 2.
 */
export default function CatchAll() {
  notFound();
}
