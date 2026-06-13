import Link from "next/link";

export default function StaticSectionPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="placeholder-page">
      <div className="placeholder-inner">
        <Link href="/" className="home-link">
          ← Home
        </Link>
        <section className="placeholder-card">
          <h1>{title}</h1>
          <p>{description}</p>
        </section>
      </div>
    </main>
  );
}
