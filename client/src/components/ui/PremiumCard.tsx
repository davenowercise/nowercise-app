export function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function PremiumCard(props: {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-2xl border border-black/5 bg-white",
        "shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
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
            <p className="mt-1 text-xs sm:text-sm text-black/55">{props.subtitle}</p>
          ) : null}
        </div>
        {props.rightSlot ? <div className="shrink-0">{props.rightSlot}</div> : null}
      </header>

      <div className="mt-4">{props.children}</div>
    </section>
  );
}

export function Badge(props: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full",
        "border border-black/5 bg-black/[0.03]",
        "px-3 py-1 text-xs font-medium text-black/70",
        props.className
      )}
    >
      {props.children}
    </span>
  );
}

export function Divider() {
  return <div className="my-4 h-px w-full bg-black/5" />;
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
