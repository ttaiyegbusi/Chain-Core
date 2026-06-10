import GlobalHeader from "@/components/GlobalHeader";
import FeatureComingSoon from "@/components/FeatureComingSoon";

export default function WalletsComingSoonPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="ml-[var(--rail-width)]">
        <GlobalHeader title="Wallets" crumbs={[{ label: "Wallets" }]} />
        <FeatureComingSoon
          featureName="Wallets"
          description="Wallets module is currently under development."
          buttonLabel="Go to Dashboard"
          buttonHref="/"
        />
      </main>
    </div>
  );
}
