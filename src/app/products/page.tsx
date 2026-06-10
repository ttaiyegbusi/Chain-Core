import GlobalHeader from "@/components/GlobalHeader";
import FeatureComingSoon from "@/components/FeatureComingSoon";

export default function ProductsComingSoonPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="ml-[var(--rail-width)]">
        <GlobalHeader title="Products" crumbs={[{ label: "Products" }]} />
        <FeatureComingSoon
          featureName="Products"
          description="Products module is currently under development."
          buttonLabel="Go to Dashboard"
          buttonHref="/"
        />
      </main>
    </div>
  );
}
