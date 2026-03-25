import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.to && !isLast ? (
              <Link className="hover:text-zinc-100" to={item.to}>
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-zinc-100" : ""}>{item.label}</span>
            )}

            {!isLast ? <span className="text-zinc-600">&rarr;</span> : null}
          </div>
        );
      })}
    </div>
  );
}
