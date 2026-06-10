import GlobalHeader from "@/components/GlobalHeader";
import FeatureComingSoon from "@/components/FeatureComingSoon";

export default function InformationComingSoonPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="ml-[var(--rail-width)]">
        <GlobalHeader title="Information" crumbs={[{ label: "Information" }]} />
        <FeatureComingSoon
          featureName="Information"
          description="Information module is currently under development."
          buttonLabel="Go to Dashboard"
          buttonHref="/"
        />
      </main>
    </div>
  );
}
