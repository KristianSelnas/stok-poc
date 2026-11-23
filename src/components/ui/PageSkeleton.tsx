import { Container } from "./Container";

/**
 * Plassholder som vises et øyeblikk mens en side lastes ved navigasjon.
 * Formen ligner en hero, så siden ikke hopper når innholdet kommer.
 */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse motion-reduce:animate-none">
      <section className="bg-stok-light">
        <Container className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2 lg:py-20">
          <div className="space-y-5">
            <div className="h-4 w-32 rounded-full bg-stok-blue/10" />
            <div className="h-12 w-4/5 rounded-2xl bg-stok-blue/10" />
            <div className="h-12 w-3/5 rounded-2xl bg-stok-blue/10" />
            <div className="h-5 w-full max-w-lg rounded-full bg-stok-blue/10" />
            <div className="h-5 w-2/3 max-w-md rounded-full bg-stok-blue/10" />
          </div>
          <div className="hidden aspect-[5/4] rounded-l-full bg-stok-blue/10 lg:block" />
        </Container>
      </section>
      <Container className="grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-3xl bg-stok-light" />
        ))}
      </Container>
    </div>
  );
}
