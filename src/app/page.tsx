import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Contents } from "@/components/Contents";
import { Work } from "@/components/Work";
import { About } from "@/components/About";
import { Stack } from "@/components/Stack";
import { Path } from "@/components/Path";
import { Appendix } from "@/components/Appendix";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { getProductionStatus } from "@/lib/proof";

export default async function Home() {
  const status = await getProductionStatus();

  const proof = {
    productionOk: status?.ok ?? false,
    checkedAt: status
      ? new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        }).format(new Date(status.checkedAt))
      : null,
  };

  return (
    <>
      <Nav />
      <main>
        <Hero proof={proof} />
        <Contents />
        <Work />
        <About />
        <Stack />
        <Path />
        <Contact />
        <Appendix />
      </main>
      <Footer />
    </>
  );
}
