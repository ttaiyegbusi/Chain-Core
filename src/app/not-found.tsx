import Link from "next/link";

export default function NotFound() {
  return (
    <main className="ml-[var(--rail-width)] flex min-h-screen flex-col items-center justify-center p-10">
      <p className="text-sm font-normal uppercase tracking-widest text-text-muted">
        Coming soon
      </p>
      <h1 className="mt-3 text-2xl font-normal text-text-primary">
        This feature isn&apos;t ready yet
      </h1>
      <p className="mt-2 max-w-md text-center text-sm font-normal text-text-secondary">
        We&apos;re still building this part of ChainCore. Head back to a section
        that&apos;s up and running.
      </p>
      <Link
        href="/accounting/charts-of-account"
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-normal text-white transition-colors hover:bg-primary-hover"
      >
        Go to Charts of Account
      </Link>
    </main>
  );
}
