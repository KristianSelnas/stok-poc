import { isSanityConfigured } from "@/sanity/env";

/** Egen rot-layout for Sanity Studio, uten nettstedets header og bunntekst. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body style={{ margin: 0 }}>
        {isSanityConfigured ? (
          children
        ) : (
          <main
            style={{ fontFamily: "system-ui, sans-serif", maxWidth: 560, margin: "15vh auto", padding: 24 }}
          >
            <h1>Sanity er ikke koblet til</h1>
            <p>
              Sett <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> i <code>.env.local</code> og start serveren på
              nytt. Se README.md.
            </p>
          </main>
        )}
      </body>
    </html>
  );
}
