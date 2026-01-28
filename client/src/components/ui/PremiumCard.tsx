export function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function PremiumCard(props: {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accent?: "teal" | "none";
}) {
  const accentTop =
    props.accent === "teal"
      ? "border-t-[3px] border-t-teal-100"
      : "border-t-[3px] border-t-transparent";

  return (
    <section
      className={cx(
        "rounded-2xl border border-black/5 bg-white",
        accentTop,
        "shadow-[0_10px_35px_rgba(0,0,0,0.06)]",
        "p-5 sm:p-6",
        props.className
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[15px] sm:text-base font-semibold tracking-tight text-black/90">
            {props.title}
          </h3>
          {props.subtitle ? (
            <p className="mt-1 text-xs sm:text-sm text-black/50">{props.subtitle}</p>
          ) : null}
        </div>

        {props.rightSlot ? <div className="shrink-0">{props.rightSlot}</div> : null}
      </header>

      <div className="mt-5">{props.children}</div>
    </section>
  );
}

export function Badge(props: {
  children: React.ReactNode;
  tone?: "quiet" | "info";
  className?: string;
}) {
  const tone =
    props.tone === "info"
      ? "border-teal-200/60 bg-teal-50 text-teal-800"
      : "border-black/5 bg-black/[0.03] text-black/60";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1",
        "text-[11px] font-medium",
        tone,
        props.className
      )}
    >
      {props.children}
    </span>
  );
}

export function Divider(props: { className?: string }) {
  return <div className={cx("my-5 h-px w-full bg-black/5", props.className)} />;
}

export function SkeletonLine(props: { widthClass?: string }) {
  return (
    <div
      className={cx(
        "h-3 rounded-full bg-black/[0.06] animate-pulse",
        props.widthClass ?? "w-full"
      )}
    />
  );
}
