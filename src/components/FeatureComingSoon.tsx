import Image from "next/image";
import Link from "next/link";

interface FeatureComingSoonProps {
  title?: string;
  featureName?: string;
  description?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export default function FeatureComingSoon({
  title = "No Page Found",
  featureName = "This feature",
  description,
  buttonLabel = "Go to Dashboard",
  buttonHref = "/",
}: FeatureComingSoonProps) {
  const copy = description ?? `${featureName} has not been implemented yet.`;

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-white px-6">
      <div className="flex max-w-[360px] flex-col items-center text-center">
        <div className="relative mb-5 h-[168px] w-[224px]">
          <Image
            src="/feature-coming-soon.png"
            alt="No page found illustration"
            fill
            priority
            sizes="224px"
            className="object-contain"
          />
        </div>

        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        <p className="mt-2 max-w-[260px] text-sm leading-5 text-text-secondary">
          {copy}
        </p>

        <Link
          href={buttonHref}
          className="focus-ring mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-7 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
