import GlobalHeader from "@/components/GlobalHeader";
import FeatureComingSoon from "@/components/FeatureComingSoon";

export default function ReportsComingSoonPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="ml-[var(--rail-width)]">
        <GlobalHeader title="Reports" crumbs={[{ label: "Reports" }]} />
        <FeatureComingSoon
          featureName="Reports"
          description="Reports module is currently under development."
          buttonLabel="Go to Dashboard"
          buttonHref="/"
        />
      </main>
    </div>
  );
}
