"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SEARCH_MIN_QUERY_LENGTH } from "@/lib/search-utils";
import { cn } from "@/lib/utils";

type SearchSuggestion = {
  id: string;
  title: string;
  meta: string | null;
  href: string;
};

type NavItem =
  | { kind: "query"; id: string; label: string; value: string }
  | { kind: "link"; id: string; label: string; href: string; meta: string | null }
  | { kind: "search-all"; id: string; label: string; value: string };

type StaticShortcut = { label: string; query: string };

type SiteSearchFormProps = {
  action: string;
  scope?: "public" | "dashboard";
  defaultQuery?: string;
  suggestedQueries?: string[];
  showPopularHint?: boolean;
  placeholder: string;
  buttonLabel: string;
  className?: string;
};

export function SiteSearchForm({
  action,
  scope = "public",
  defaultQuery = "",
  suggestedQueries,
  showPopularHint = false,
  placeholder,
  buttonLabel,
  className,
}: SiteSearchFormProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [liveSuggestions, setLiveSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  const trimmedQuery = query.trim();
  const showStaticSuggestions = trimmedQuery.length < SEARCH_MIN_QUERY_LENGTH;

  const staticQueries =
    suggestedQueries ??
    (scope === "dashboard"
      ? (t.raw("dashboardStaticQueries") as string[])
      : (t.raw("staticQueries") as string[]));

  const staticShortcuts =
    scope === "dashboard"
      ? (t.raw("dashboardStaticShortcuts") as StaticShortcut[])
      : (t.raw("staticShortcuts") as StaticShortcut[]);

  const navItems = useMemo<NavItem[]>(() => {
    if (showStaticSuggestions) {
      return [
        ...staticQueries.map((value) => ({
          kind: "query" as const,
          id: `query-${value}`,
          label: value,
          value,
        })),
        ...staticShortcuts.map((shortcut) => ({
          kind: "query" as const,
          id: `shortcut-${shortcut.label}`,
          label: shortcut.label,
          value: shortcut.query,
        })),
      ];
    }

    const items: NavItem[] = liveSuggestions.map((suggestion) => ({
      kind: "link",
      id: suggestion.id,
      label: suggestion.title,
      href: suggestion.href,
      meta: suggestion.meta,
    }));

    if (trimmedQuery.length >= SEARCH_MIN_QUERY_LENGTH) {
      items.push({
        kind: "search-all",
        id: "search-all",
        label: t("searchAll", { query: trimmedQuery }),
        value: trimmedQuery,
      });
    }

    return items;
  }, [
    showStaticSuggestions,
    staticQueries,
    staticShortcuts,
    liveSuggestions,
    trimmedQuery,
    t,
  ]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmedQuery, liveSuggestions.length, showStaticSuggestions]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>(
      `[data-nav-index="${activeIndex}"]`
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    if (trimmedQuery.length < SEARCH_MIN_QUERY_LENGTH) {
      setLiveSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search/suggest?scope=${scope}&q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          setLiveSuggestions([]);
          return;
        }
        const data = (await response.json()) as { suggestions?: SearchSuggestion[] };
        setLiveSuggestions(data.suggestions ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setLiveSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [trimmedQuery, scope]);

  function applySearchQuery(value: string) {
    setQuery(value);
    const next = value.trim();
    if (next.length < SEARCH_MIN_QUERY_LENGTH) return;
    router.push(`${action}?q=${encodeURIComponent(next)}`);
  }

  function activateNavItem(item: NavItem) {
    if (item.kind === "link") {
      router.push(item.href);
      return;
    }
    applySearchQuery(item.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeIndex >= 0 && navItems[activeIndex]) {
      activateNavItem(navItems[activeIndex]);
      return;
    }
    applySearchQuery(trimmedQuery);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (navItems.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current >= navItems.length - 1 ? 0 : current + 1
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? navItems.length - 1 : current - 1
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const item = navItems[activeIndex];
      if (item) activateNavItem(item);
      return;
    }

    if (event.key === "Escape") {
      setActiveIndex(-1);
      (event.currentTarget as HTMLInputElement).blur();
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/50" />
          <Input
            id="site-search-input"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            className="ps-10"
            autoFocus={!defaultQuery}
            autoComplete="off"
            role="combobox"
            aria-expanded={navItems.length > 0}
            aria-controls="search-suggestions-list"
            aria-activedescendant={
              activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
            }
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {buttonLabel}
        </button>
      </form>

      {showStaticSuggestions ? (
        <div
          id="search-suggestions-list"
          ref={listRef}
          className="space-y-3"
          role="listbox"
        >
          <div>
            <p className="mb-2 text-xs font-medium text-text/60">
              {t("suggestionsLabel")}
              {showPopularHint ? (
                <span className="ms-1 font-normal text-text/50">
                  · {t("popularSuggestionsHint")}
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-2">
              {staticQueries.map((suggestion, index) => (
                <button
                  key={suggestion}
                  id={`search-option-${index}`}
                  data-nav-index={index}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => applySearchQuery(suggestion)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    activeIndex === index
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/70 bg-card text-heading hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-text/60">
              {t("shortcutsLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {staticShortcuts.map((shortcut, shortcutIndex) => {
                const index = staticQueries.length + shortcutIndex;
                return (
                  <button
                    key={shortcut.label}
                    id={`search-option-${index}`}
                    data-nav-index={index}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => applySearchQuery(shortcut.query)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      activeIndex === index
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary hover:bg-primary/15"
                    )}
                  >
                    {shortcut.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div id="search-suggestions-list" ref={listRef}>
            <div className="border-b border-border/60 px-4 py-2.5">
              <p className="text-xs font-medium text-text/60">
                {t("liveSuggestionsLabel")}
              </p>
            </div>
            {isLoading ? (
              <p className="px-4 py-3 text-sm text-text/60">{t("searching")}</p>
            ) : liveSuggestions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-text/60">{t("noResults")}</p>
            ) : (
              <ul className="divide-y divide-border/60" role="listbox">
                {liveSuggestions.map((suggestion, index) => (
                  <li key={suggestion.id} role="presentation">
                    <Link
                      id={`search-option-${index}`}
                      data-nav-index={index}
                      href={suggestion.href}
                      role="option"
                      aria-selected={activeIndex === index}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "flex flex-col gap-0.5 px-4 py-3 transition-colors",
                        activeIndex === index
                          ? "bg-primary/8"
                          : "hover:bg-primary/4"
                      )}
                    >
                      {suggestion.meta ? (
                        <span className="text-xs font-medium text-primary">
                          {suggestion.meta}
                        </span>
                      ) : null}
                      <span className="line-clamp-1 text-sm font-semibold text-heading">
                        {suggestion.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-border/60 px-4 py-2.5">
              <button
                id={`search-option-${liveSuggestions.length}`}
                data-nav-index={liveSuggestions.length}
                type="button"
                role="option"
                aria-selected={activeIndex === liveSuggestions.length}
                onMouseEnter={() => setActiveIndex(liveSuggestions.length)}
                onClick={() => applySearchQuery(trimmedQuery)}
                className={cn(
                  "w-full rounded-lg px-2 py-1 text-start text-sm font-semibold transition-colors",
                  activeIndex === liveSuggestions.length
                    ? "bg-primary/8 text-primary"
                    : "text-primary hover:text-primary-hover"
                )}
              >
                {t("searchAll", { query: trimmedQuery })}
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
