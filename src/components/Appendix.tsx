import { Section } from "./Section";
import { Reveal } from "./Reveal";
import { InfluenceMap } from "./InfluenceMap";

/** Appendix — the supporting material a real dossier files at the back.
 *  A: the influence map (fig. A), the intellectual system behind the work.
 *  B: provenance — where the debugging habit actually comes from.
 */
export function Appendix() {
  return (
    <Section
      id="appendix"
      index="A."
      label="Appendix"
      title="The other system I run on."
      lede={
        <>
          The numbered sections document what I built. This appendix documents
          what built me. Two things I keep coming back to:{" "}
          <em className="text-text">
            Plato&apos;s cave and Turing&apos;s machine
          </em>{" "}
          — everything below is filed under one of the two.
        </>
      }
    >
      <div className="space-y-16">
        <Reveal>
          <InfluenceMap />
        </Reveal>

        {/* Appendix B — provenance */}
        <Reveal>
          <div className="max-w-3xl">
            <p className="mono-label mb-4">Appendix B — Provenance</p>
            <div className="border-l-2 border-accent/60 pl-6">
              <p className="font-serif text-2xl italic leading-snug text-text sm:text-[1.7rem]">
                The first systems I debugged had grease on them.
              </p>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-text-muted">
                <p>
                  Cascalheira &amp; Filho is my family&apos;s workshop in
                  Proença-a-Nova — chainsaws, bicycles, tractor parts. I spent
                  the summer before FEUP at the bench: open the machine, find
                  the failing part, fix the actual fault, put it back together.
                  The summer after first year I went back and replaced the
                  paper records with software I wrote for them.
                </p>
                <p>
                  The method survived the change of material. Everything in
                  this dossier — the schema, the production discipline — is
                  bench work with cleaner hands.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
