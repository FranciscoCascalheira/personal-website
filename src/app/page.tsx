import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Work } from "@/components/Work";
import { About } from "@/components/About";
import { Stack } from "@/components/Stack";
import { Path } from "@/components/Path";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Stack />
        <Path />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
