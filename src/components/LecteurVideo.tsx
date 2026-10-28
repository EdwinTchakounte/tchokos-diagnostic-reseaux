"use client";
import { useRef, useState } from "react";

// Affiche seule au chargement (aucune donnée vidéo téléchargée) ; la vidéo se charge au toucher, avec le son.
export default function LecteurVideo({
  affiche,
  src,
  titre,
  className = "",
  arrondi = "rounded-2xl",
}: {
  affiche: string;
  src?: string;
  titre: string;
  className?: string;
  arrondi?: string;
}) {
  const [actif, setActif] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <div className={`relative aspect-[9/16] overflow-hidden bg-encre ${arrondi} ${className}`}>
      {actif && src ? (
        <video
          ref={ref}
          src={src}
          poster={affiche}
          controls
          autoPlay
          playsInline
          preload="none"
          className="h-full w-full object-cover"
          onEnded={() => setActif(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => src && setActif(true)}
          className="group absolute inset-0 h-full w-full text-left"
          aria-label={src ? `Lire l'extrait : ${titre}` : titre}
          disabled={!src}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={affiche} alt={titre} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          {src && (
            <span className="absolute inset-0 grid place-items-center bg-gradient-to-t from-encre/40 via-transparent to-transparent">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 shadow-lg ring-4 ring-white/30 transition group-hover:scale-110 group-active:scale-95">
                <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-orange" aria-hidden>
                  <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
                </svg>
              </span>
            </span>
          )}
        </button>
      )}
    </div>
  );
}
