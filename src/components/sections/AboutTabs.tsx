"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import buildImage from "@/assets/ditheredbuilddark.png";
import buildLightImage from "@/assets/ditheredbuildlight.png";
import communityImage from "@/assets/ditheredcommunitydark.png";
import communityLightImage from "@/assets/ditheredcommunitylight.png";
import learnImage from "@/assets/ditheredlearndark.png";
import learnLightImage from "@/assets/ditheredlearnlight.png";
import type { AboutTab, AboutTabId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AboutTabsProps {
  tabs: AboutTab[];
}

const tabImages: Record<AboutTabId, { dark: StaticImageData; light: StaticImageData }> = {
  build: { dark: buildImage, light: buildLightImage },
  community: { dark: communityImage, light: communityLightImage },
  learn: { dark: learnImage, light: learnLightImage },
};

export function AboutTabs({ tabs }: AboutTabsProps) {
  const tabsId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeTabId, setActiveTabId] = useState<AboutTabId | undefined>(tabs[0]?.id);
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTabId));
  const activeTab = tabs[activeIndex];
  const reduceMotion = useReducedMotion();

  if (!activeTab) return null;

  function selectTab(index: number) {
    const tab = tabs[index];
    if (!tab) return;
    setActiveTabId(tab.id);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    selectTab(nextIndex);
  }

  const panelId = `${tabsId}-panel`;

  return (
    <div className="mt-10 sm:mt-12">
      <div className="flex justify-center">
        <div aria-label="About focus" className="flex flex-wrap justify-center gap-1 rounded-full border border-border bg-background-soft/40 p-1" role="tablist">
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab.id;
            return (
              <button
                key={tab.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                id={`${tabsId}-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-controls={panelId}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-accent text-background" : "text-muted hover:bg-hover hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${tabsId}-tab-${activeTab.id}`}
        tabIndex={0}
        className="mt-12 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:mt-16"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeTab.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={{
              duration: reduceMotion ? 0 : 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="grid gap-8 text-left lg:grid-cols-[minmax(0,0.85fr)_minmax(24rem,1.15fr)] lg:items-center lg:gap-16"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Placeholder direction</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{activeTab.label}</h3>
            </div>

            <div className="w-full justify-self-end">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-border bg-background-soft/50">
                <Image
                  src={tabImages[activeTab.id].dark}
                  alt=""
                  fill
                  unoptimized
                  quality={100}
                  sizes="(min-width: 1024px) 40rem, (min-width: 640px) 80vw, calc(100vw - 3rem)"
                  className="object-cover light:hidden"
                />
                <Image
                  src={tabImages[activeTab.id].light}
                  alt=""
                  fill
                  unoptimized
                  quality={100}
                  sizes="(min-width: 1024px) 40rem, (min-width: 640px) 80vw, calc(100vw - 3rem)"
                  className="hidden object-cover light:block"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
