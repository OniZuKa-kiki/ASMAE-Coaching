"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;
const GAP_PX = 32;
const SLIDE_SPRING = { type: "spring" as const, stiffness: 320, damping: 34 };

export type TestimonialCarouselItem = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
};

function useCardsPerView() {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setPerView(3);
      } else if (window.matchMedia("(min-width: 768px)").matches) {
        setPerView(2);
      } else {
        setPerView(1);
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perView;
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialCarouselItem }) {
  return (
    <Card className="flex h-full flex-col select-none">
      <div className="mb-4 flex gap-1">
        {Array.from({ length: testimonial.rating }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-accent text-accent" />
        ))}
      </div>
      <p className="mb-6 flex-1 text-text italic leading-relaxed">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <div>
        <p className="font-semibold text-heading">{testimonial.name}</p>
        {testimonial.role ? (
          <p className="text-sm text-text/70">{testimonial.role}</p>
        ) : null}
      </div>
    </Card>
  );
}

export function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: TestimonialCarouselItem[];
}) {
  const t = useTranslations("testimonials");
  const perView = useCardsPerView();
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [dragLot, setDragLot] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [slideStep, setSlideStep] = useState(0);
  const [visualIndex, setVisualIndex] = useState(0);

  const count = testimonials.length;
  const maxIndex = Math.max(0, count - perView);
  const lotCount = maxIndex + 1;
  const canSlide = lotCount > 1 && slideStep > 0;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(maxIndex, next));
      setIndex(clamped);
      setDragLot(clamped);
    },
    [maxIndex]
  );

  const goNext = useCallback(() => {
    goTo(index >= maxIndex ? 0 : index + 1);
  }, [goTo, index, maxIndex]);

  const goPrev = useCallback(() => {
    goTo(index <= 0 ? maxIndex : index - 1);
  }, [goTo, index, maxIndex]);

  useEffect(() => {
    setIndex(0);
    setDragLot(0);
    setVisualIndex(0);
    x.set(0);
  }, [perView, count, x]);

  useMotionValueEvent(x, "change", (latest) => {
    if (!slideStep) return;
    const derived = Math.round(-latest / slideStep);
    const clamped = Math.max(0, Math.min(maxIndex, derived));
    setVisualIndex(clamped);
    if (isDraggingRef.current) {
      setDragLot(clamped);
    }
  });

  useEffect(() => {
    if (!canSlide || paused || isDragging) return;
    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [canSlide, paused, isDragging, goNext]);

  useEffect(() => {
    if (!isDragging) {
      setVisualIndex(index);
    }
  }, [index, isDragging]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateStep = () => {
      const width = viewport.offsetWidth;
      const cardWidth = (width - GAP_PX * (perView - 1)) / perView;
      const nextStep = cardWidth + GAP_PX;
      setSlideStep(nextStep);
      if (!isDraggingRef.current && nextStep > 0) {
        const currentIndex = Math.max(
          0,
          Math.min(maxIndex, Math.round(-x.get() / nextStep))
        );
        x.set(-currentIndex * nextStep);
      }
    };

    updateStep();

    const observer = new ResizeObserver(updateStep);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [perView, count, maxIndex, x]);

  useEffect(() => {
    if (!slideStep || isDragging) return;
    const controls = animate(x, -index * slideStep, SLIDE_SPRING);
    return () => controls.stop();
  }, [index, slideStep, isDragging, x]);

  function handleDragEnd(_event: unknown, info: PanInfo) {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (!canSlide || !slideStep) return;

    const draggedX = x.get();
    let nextIndex = Math.round(-draggedX / slideStep);

    if (Math.abs(info.velocity.x) > 350) {
      nextIndex = info.velocity.x < 0 ? visualIndex + 1 : visualIndex - 1;
    }

    nextIndex = Math.max(0, Math.min(maxIndex, nextIndex));
    goTo(nextIndex);
  }

  if (count === 0) return null;

  const cardWidth =
    slideStep > 0
      ? slideStep - GAP_PX
      : `calc((100% - ${(perView - 1) * GAP_PX}px) / ${perView})`;

  const dragLimit = slideStep > 0 ? maxIndex * slideStep : 0;

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
          <p className="min-w-0 text-xs text-text/60">{t("carouselHint")}</p>
          <div
            dir="ltr"
            className="flex shrink-0 items-center gap-2 self-end sm:self-auto"
          >
            <button
              type="button"
              onClick={goPrev}
              aria-label={t("previous")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-heading transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={t("next")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-heading transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div ref={viewportRef} className="overflow-hidden" dir="ltr">
        {canSlide ? (
          <motion.div
            className="flex cursor-grab gap-8 active:cursor-grabbing"
            style={{ x, touchAction: "pan-y" }}
            drag="x"
            dragConstraints={{ left: -dragLimit, right: 0 }}
            dragElastic={0.06}
            dragMomentum={false}
            onDragStart={() => {
              isDraggingRef.current = true;
              setIsDragging(true);
              setDragLot(visualIndex);
            }}
            onDragEnd={handleDragEnd}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="shrink-0"
                style={{ width: cardWidth, minWidth: cardWidth }}
                dir="auto"
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </motion.div>
        ) : (
          <div
            className={cn(
              "grid gap-8",
              perView >= 3
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : perView === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
            )}
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}
      </div>

      {canSlide ? (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: lotCount }, (_, lotIndex) => (
              <button
                key={lotIndex}
                type="button"
                aria-label={`${t("positionLabel")} ${lotIndex + 1}`}
                aria-current={lotIndex === visualIndex ? "true" : undefined}
                onClick={() => goTo(lotIndex)}
                className={cn(
                  "h-2.5 rounded-full transition-[width,background-color] duration-200",
                  lotIndex === visualIndex
                    ? "w-7 bg-primary"
                    : "w-2.5 bg-border hover:bg-primary/40"
                )}
              />
            ))}
          </div>
          <Link
            href="/testimonials"
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Link
            href="/testimonials"
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
