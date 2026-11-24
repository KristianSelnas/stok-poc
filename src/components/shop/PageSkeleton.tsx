/** Plassholder mens innholdet på Min side lastes. */
export function MinSideSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6 motion-reduce:animate-none">
      <div className="h-10 w-64 rounded-2xl bg-white" />
      <div className="h-64 rounded-3xl bg-white" />
    </div>
  );
}
