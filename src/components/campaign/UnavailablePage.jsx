import Link from "next/link";
import { resolveUnavailablePage } from "@/utils/unavailablePage";

/**
 * Public "campaign unavailable" page. Works as a server or client component.
 * `config` may be a form's stored config, an empty object, or undefined.
 */
export default function UnavailablePage({ config }) {
  const page = resolveUnavailablePage(config);

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-[#F9FAFB] px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-[#111827] sm:text-4xl">{page.title}</h1>
        {page.description ? (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#6B7280] sm:text-[15px]">
            {page.description}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {page.primaryButton?.label ? (
            <Link
              href={page.primaryButton.url || "#"}
              className="rounded-full bg-[#EA3335] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d02c2e]"
            >
              {page.primaryButton.label}
            </Link>
          ) : null}

          {page.secondaryButton?.label ? (
            <Link
              href={page.secondaryButton.url || "#"}
              className="rounded-full border border-[#111827] px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#111827] hover:text-white"
            >
              {page.secondaryButton.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
