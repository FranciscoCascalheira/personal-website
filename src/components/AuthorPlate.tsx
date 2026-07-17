"use client";

import Image from "next/image";
import { useState } from "react";

/** Plate I — the author, engraved in the same ink as his influences.
 *  The engraving is the document's default; the photograph stays one press
 *  away (and in the metadata, for the humans who hire humans). Print gets
 *  the ivory engraving unless the reader deliberately toggled the photo.
 */
export function AuthorPlate() {
  const [showPhoto, setShowPhoto] = useState(false);

  return (
    <figure>
      <div className="plate-paper relative aspect-[4/5] overflow-hidden border border-border">
        <Image
          src="/portrait.jpg"
          alt="Francisco Cascalheira"
          fill
          sizes="(max-width: 1024px) 100vw, 300px"
          className={`object-cover ${showPhoto ? "" : "invisible"}`}
          priority={false}
        />
        {!showPhoto && (
          <>
            {/* the ivory variant loads eagerly — it is what prints */}
            <img
              src="/portraits/author-l1.png"
              alt="Francisco Cascalheira — engraved plate"
              loading="eager"
              decoding="async"
              className="plate-img-light absolute inset-0 h-full w-full object-cover"
            />
            <img
              src="/portraits/author-d1.png"
              alt="Francisco Cascalheira — engraved plate"
              loading="lazy"
              decoding="async"
              className="plate-img-dark absolute inset-0 h-full w-full object-cover"
            />
          </>
        )}
      </div>
      <figcaption className="mono-label mt-3 flex items-center justify-between gap-4 border-b border-border pb-3">
        <span>Plate I — the author</span>
        <button
          type="button"
          onClick={() => setShowPhoto((p) => !p)}
          className="no-print accent-underline text-accent-text"
        >
          {showPhoto ? "view engraving" : "view photograph"}
        </button>
      </figcaption>
    </figure>
  );
}
