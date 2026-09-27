"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { AboutTab } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AboutTabsProps {
  tabs: AboutTab[];
}

export function AboutTabs({ tabs }: AboutTabsProps) {
  const tabsId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeTabId),
  );
  const activeTab = tabs[activeIndex];

  if (!activeTab) return null;

  function selectTab(index: number) {
    const tab = tabs[index];
    if (!tab) return;

    setActiveTabId(tab.id);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    selectTab(nextIndex);
  }

  const panelId = `${tabsId}-panel`;

  return (
    <div>
      <div className="mt-8 flex justify-center">
        <div
          aria-label="About focus"
          className="flex flex-wrap justify-center gap-1 rounded-full border border-border bg-background-soft/40 p-1"
          role="tablist"
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab.id;

            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
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
                  isActive
                    ? "bg-accent text-background"
                    : "text-muted hover:bg-hover hover:text-foreground",
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
        className="mt-10 grid gap-10 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)] lg:items-center lg:gap-16"
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Placeholder direction
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {activeTab.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {activeTab.description}
          </p>
        </div>

        <div className="w-full max-w-md justify-self-end">
          <div className="rounded-[1.5rem] border border-border bg-background-soft/50 p-3">
            <div className="rounded-[1.1rem] border border-border bg-background p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                <span>{activeTab.label} / visual</span>
                <span>{String(activeIndex + 1).padStart(2, "0")}</span>
              </div>

              <div
                aria-hidden="true"
                className="mt-10 grid grid-cols-[1.15fr_0.85fr] gap-3"
              >
                <div className="space-y-3">
                  <div className="h-3 w-4/5 rounded-full bg-accent/30" />
                  <div className="h-3 w-full rounded-full bg-border" />
                  <div className="h-3 w-3/5 rounded-full bg-border" />
                </div>
                <div className="h-20 rounded-xl border border-dashed border-accent/40 bg-accent/5" />
              </div>

              <div className="mt-12 border-t border-border pt-4">
                <p className="text-sm font-medium">{activeTab.cardLabel}</p>
                <p className="mt-1 text-xs text-muted">{activeTab.cardDetail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
