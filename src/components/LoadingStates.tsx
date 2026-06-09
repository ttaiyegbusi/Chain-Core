"use client";

import { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
  skeleton?: ReactNode;
  delay?: number;
  className?: string;
};

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return <div className={`page-transition-in ${className}`}>{children}</div>;
}

export function TablePageSkeleton({ showStats = true }: { showStats?: boolean }) {
  return (
    <div className="space-y-4" aria-label="Loading page content">
      {showStats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[132px] rounded-xl border border-border bg-white p-4">
              <div className="skeleton-shimmer h-3 w-24 rounded-full" />
              <div className="mt-8 skeleton-shimmer h-3 w-40 rounded-full" />
              <div className="mt-3 skeleton-shimmer h-6 w-28 rounded-full" />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="skeleton-shimmer h-10 w-[360px] rounded-md" />
        <div className="flex gap-2">
          <div className="skeleton-shimmer h-10 w-24 rounded-md" />
          <div className="skeleton-shimmer h-10 w-24 rounded-md" />
          <div className="skeleton-shimmer h-10 w-40 rounded-md" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="grid grid-cols-5 gap-6 bg-surface-muted px-5 py-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-3 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="grid grid-cols-5 gap-6 border-t border-border px-5 py-4">
            {Array.from({ length: 5 }).map((_, col) => (
              <div key={col} className="skeleton-shimmer h-4 rounded-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="mx-auto max-w-[720px] space-y-5" aria-label="Loading form content">
      <div className="space-y-2">
        <div className="skeleton-shimmer h-5 w-56 rounded-full" />
        <div className="skeleton-shimmer h-3 w-80 rounded-full" />
      </div>
      <div className="h-px bg-border" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="skeleton-shimmer h-3 w-32 rounded-full" />
          <div className="skeleton-shimmer h-11 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function CanvasPageSkeleton() {
  return (
    <div className="h-[760px] rounded-xl border border-border bg-[#f8fafc] p-4" aria-label="Loading canvas">
      <div className="flex justify-between gap-3">
        <div className="skeleton-shimmer h-10 w-[360px] rounded-md" />
        <div className="flex gap-2">
          <div className="skeleton-shimmer h-10 w-24 rounded-md" />
          <div className="skeleton-shimmer h-10 w-24 rounded-md" />
          <div className="skeleton-shimmer h-10 w-40 rounded-md" />
        </div>
      </div>
      <div className="mt-16 flex justify-center">
        <div className="skeleton-shimmer h-20 w-[270px] rounded-xl" />
      </div>
      <div className="mx-auto mt-10 h-24 w-px bg-border" />
      <div className="mt-10 flex justify-center gap-10">
        <div className="skeleton-shimmer h-20 w-[270px] rounded-xl" />
        <div className="skeleton-shimmer h-20 w-[270px] rounded-xl" />
        <div className="skeleton-shimmer h-20 w-[270px] rounded-xl" />
      </div>
    </div>
  );
}
