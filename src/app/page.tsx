import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Team } from "@/components/sections/Team";
import { Meetings } from "@/components/sections/Meetings";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
      >
        Skip to content
      </a>
      <Header />
      <main>
        <Hero />
        <About />
        <Projects />
        <Meetings />
        <Team />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
