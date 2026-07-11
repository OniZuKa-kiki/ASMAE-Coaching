"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  TestimonialFullCard,
  type TestimonialPageItem,
} from "@/components/testimonials/testimonial-full-card";

const AUTOPLAY_MS = 8000;
const ROWS = 3;
const SLIDE_SPRING = { type: "spring" as const, stiffness: 320, damping: 34 };

function useColumnsPerView() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setCols(3);
      } else if (window.matchMedia("(min-width: 768px)").matches) {
        setCols(2);
      } else {
        setCols(1);
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

function chunkPages<T>(items: T[], pageSize: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
}

function PageGrid({
  items,
  cols,
}: {
  items: TestimonialPageItem[];
  cols: number;
}) {
  const rows = chunkPages(items, cols);

  return (
    <div className="space-y-8">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            "grid gap-8",
            row.length >= 3 && cols >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            row.length === 2 && cols >= 2 && "grid-cols-1 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto lg:w-full",
            row.length === 1 && "grid-cols-1 max-w-md mx-auto"
          )}
        >
          {row.map((testimonial) => (
            <TestimonialFullCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TestimonialsPageCarousel({
  testimonials,
}: {
  testimonials: TestimonialPageItem[];
}) {
  const t = useTranslations("testimonials");
  const cols = useColumnsPerView();
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [dragLot, setDragLot] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);

  const pageSize = cols * ROWS;
  const pages = chunkPages(testimonials, pageSize);
  const pageCount = pages.length;
  const maxIndex = Math.max(0, pageCount - 1);
  const canSlide = pageCount > 1;
  const displayLot = isDragging ? dragLot : index;

  const goNext = useCallback(() => {
    setIndex((current) => (current >= maxIndex ? 0 : current + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setIndex((current) => (current <= 0 ? maxIndex : current - 1));
  }, [maxIndex]);

  useEffect(() => {
    setIndex(0);
    setDragLot(0);
    x.set(0);
  }, [cols, testimonials.length, x]);

  useMotionValueEvent(x, "change", (latest) => {
    if (!pageWidth || !isDraggingRef.current) return;
    const derived = Math.round(-latest / pageWidth);
    setDragLot(Math.max(0, Math.min(maxIndex, derived)));
  });

  useEffect(() => {
    if (!canSlide || paused || isDragging) return;
    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [canSlide, paused, isDragging, goNext]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateWidth = () => setPageWidth(viewport.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [testimonials.length, cols]);

  useEffect(() => {
    if (!pageWidth || isDragging) return;
    const controls = animate(x, -index * pageWidth, SLIDE_SPRING);
    return () => controls.stop();
  }, [index, pageWidth, isDragging, x]);

  function handleDragEnd(_event: unknown, info: PanInfo) {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (!canSlide || !pageWidth) return;

    const draggedX = x.get();
    let nextIndex = Math.round(-draggedX / pageWidth);

    if (Math.abs(info.velocity.x) > 350) {
      nextIndex = info.velocity.x < 0 ? dragLot + 1 : dragLot - 1;
    }

    nextIndex = Math.max(0, Math.min(maxIndex, nextIndex));
    setIndex(nextIndex);
    setDragLot(nextIndex);
  }

  if (testimonials.length === 0) return null;

  const dragLimit = pageWidth > 0 ? maxIndex * pageWidth : 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {canSlide ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-xs text-text/60">
            {t("carouselHint")}
          </p>
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={goPrev}
              aria-label={t("previous")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-heading transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={t("next")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-heading transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div ref={viewportRef} className="overflow-hidden">
        {canSlide ? (
          <motion.div
            className="flex cursor-grab active:cursor-grabbing"
            style={{ x, touchAction: "pan-y" }}
            drag="x"
            dragConstraints={{ left: -dragLimit, right: 0 }}
            dragElastic={0.06}
            dragMomentum={false}
            onDragStart={() => {
              isDraggingRef.current = true;
              setIsDragging(true);
              setDragLot(index);
            }}
            onDragEnd={handleDragEnd}
          >
            {pages.map((page, pageIndex) => (
              <div
                key={pageIndex}
                className="w-full shrink-0 pe-0"
                style={{ width: pageWidth || "100%" }}
              >
                <PageGrid items={page} cols={cols} />
              </div>
            ))}
          </motion.div>
        ) : (
          <PageGrid items={testimonials} cols={cols} />
        )}
      </div>

      {canSlide ? (
        <div className="mt-8 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, lotIndex) => (
              <button
                key={lotIndex}
                type="button"
                aria-label={`${t("positionLabel")} ${lotIndex + 1}`}
                aria-current={lotIndex === displayLot ? "true" : undefined}
                onClick={() => {
                  setIndex(lotIndex);
                  setDragLot(lotIndex);
                }}
                className={cn(
                  "h-2.5 rounded-full transition-[width,background-color] duration-200",
                  lotIndex === displayLot
                    ? "w-7 bg-primary"
                    : "w-2.5 bg-border hover:bg-primary/40"
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
