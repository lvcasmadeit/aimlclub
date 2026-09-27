"use client";

import Image, { type StaticImageData } from "next/image";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import buildImage from "@/assets/ditheredbuilddark.png";
import communityImage from "@/assets/ditheredcommunitydark.png";
import learnImage from "@/assets/ditheredlearndark.png";
import type { AboutTab, AboutTabId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AboutTabsProps {
  tabs: AboutTab[];
}

const tabImages: Record<AboutTabId, StaticImageData> = {
  build: buildImage,
  community: communityImage,
  learn: learnImage,
};

export function AboutTabs({ tabs }: AboutTabsProps) {
  const tabsId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeTabId, setActiveTabId] = useState<AboutTabId | undefined>(tabs[0]?.id);
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTabId));
  const activeTab = tabs[activeIndex];

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
    <div className="mt-16 sm:mt-20">
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
        className="mt-10 grid gap-10 outline-none focus-visible:ring-2 focus-visible:ring-accent lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)] lg:items-center lg:gap-16"
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Placeholder direction</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{activeTab.label}</h3>
        </div>

        <div className="w-full max-w-md justify-self-end">
          <div className="rounded-[1.5rem] border border-border bg-background-soft/50 p-3">
            <div className="rounded-[1.1rem] border border-border bg-background p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                <span>{activeTab.label} / visual</span>
                <span>{String(activeIndex + 1).padStart(2, "0")}</span>
              </div>
              <div aria-hidden="true" className="relative mt-6 aspect-[4/3] overflow-hidden rounded-xl border border-border">
                <Image src={tabImages[activeTab.id]} alt="" fill sizes="(min-width: 1024px) 28rem, 100vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
