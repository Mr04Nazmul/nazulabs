"use client";

import * as React from "react";
import { createRoot } from "react-dom/client";
import LycorisSpecimen from "@/components/ui/lycoris-specimen";
import "../styles/lycoris.css";

function NazorixHero() {
  React.useEffect(() => {
    const fallback = document.getElementById("nazorix-hero-fallback");
    if (fallback) fallback.hidden = true;
    return () => {
      if (fallback) fallback.hidden = false;
    };
  }, []);

  return (
    <div className="nazorix-specimen-shell w-full">
      <h1 className="sr-only">NAZORIX — The network participation layer</h1>
      <LycorisSpecimen
        name="Nazorix"
        studio="NAZORIX Network"
        year="2026"
        description="A participation-first ecosystem. Connect, run nodes, collect points and grow the network together."
        specs={[
          "Node participation",
          "Points & participation history",
          "Community & referrals",
          "Built to evolve",
        ]}
        tagline={[
          { text: "Build" },
          { text: "with", small: true },
          { text: "purpose" },
          { text: "grow together", small: true },
        ]}
        multilingual="Connect·Grow"
        ligatureWord="Affluent"
        ink="#060918"
        bone="#c5d0e4"
        crimson="#aa88ff"
        links={[
          { label: "JOIN NAZORIX", href: "login.html?mode=create" },
          { label: "EXPLORE THE NETWORK", href: "#network" },
        ]}
      />
    </div>
  );
}

const mount = document.getElementById("nazorix-specimen-root");
if (mount) createRoot(mount).render(<NazorixHero />);
