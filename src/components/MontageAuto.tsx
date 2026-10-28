"use client";
import { useEffect, useRef, useState } from "react";

// Lecture automatique muette quand la vidéo est à l'écran (rien n'est chargé avant).
export default function MontageAuto({ src, affiche, titre }: { src: string; affiche?: string; titre: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muet, setMuet] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduit) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 },
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-encre shadow-xl shadow-encre/20 ring-1 ring-white/10">
      <video
        ref={ref}
        src={src}
        poster={affiche}
        muted={muet}
        loop
        playsInline
        preload="none"
        aria-label={titre}
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={() => {
          const v = ref.current;
          setMuet((m) => !m);
          if (v) {
            v.muted = !muet;
            v.play().catch(() => {});
          }
        }}
        className="absolute right-3 bottom-3 rounded-full bg-encre/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
      >
        {muet ? "🔇 Activer le son" : "🔊 Couper le son"}
      </button>
    </div>
  );
}
