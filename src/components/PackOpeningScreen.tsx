// ═══════════════════════════════════════════════════════════════════════════
//  PackOpeningScreen — Abertura cinematográfica de pacotes de figurinhas
//  Design tokens: milho, fogueira, folha, palha, noite (tailwind.config.js)
//  Raridades: comum | rara | brilhante  (stickers.ts)
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { Album, Sparkles, X } from "lucide-react";
import { type Sticker } from "../data/stickers";
import { unlockRandomSticker } from "../storage/webProgress";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STICKER_EMOJIS: Record<string, string> = {
  "luiz-gonzaga": "🎸",
  "gonzaguinha": "🎵",
  "clemilda": "🎤",
  "gerson-filho": "🪗",
  "forro-caju": "🎪",
  "mercado-municipal": "🏛️",
  "rua-sao-joao": "🎉",
  "orla-atalaia": "🌊",
  "quadrilhas-juninas": "💃",
  "forro-pe-de-serra": "🎶",
};

const PACK_COUNT = 3; // figurinhas por pacote

type OpeningPhase =
  | "idle"       // pack flutuando
  | "touched"    // usuário tocou
  | "tearing"    // rasgo acontecendo
  | "revealing"  // cartas viradas aparecem
  | "flipping"   // usuário revelando cada uma
  | "complete";  // todas reveladas

interface CardState {
  sticker: Sticker;
  isDuplicate: boolean;
  flipped: boolean;
  flipping: boolean;
}

interface PackOpeningScreenProps {
  onComplete: () => void;
  onOpenAnother?: () => void;
  hasEnergy?: boolean;
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function vibrate(pattern: number | number[]) {
  try { navigator.vibrate?.(pattern); } catch { /* silencioso */ }
}

// ─── Sub-componente: Partículas ────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  type: "up" | "rain" | "spiral";
  delay: number;
  duration: number;
}

function Particles({ particles }: { particles: Particle[] }) {
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className={cx(
            "pointer-events-none absolute rounded-full",
            p.type === "up" && "animate-particle-up",
            p.type === "rain" && "animate-particle-rain",
            p.type === "spiral" && "animate-particle-spiral",
          )}
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            animationFillMode: "forwards",
            zIndex: 60,
          }}
        />
      ))}
    </>
  );
}

// ─── Sub-componente: Figurinha ─────────────────────────────────────────────────

function StickerCard({
  card,
  index,
  visible,
  onFlip,
}: {
  card: CardState;
  index: number;
  visible: boolean;
  onFlip: () => void;
}) {
  const rotation = [-6, 0, 6][index] ?? 0;
  const emoji = STICKER_EMOJIS[card.sticker.id] ?? "🎵";
  const { rarity, palette } = card.sticker;

  const rarityConfig = {
    brilhante: {
      label: "✨ Brilhante",
      glowColor: "#F8C23A",
      textColor: "#7A2E17",
      badgeBg: "linear-gradient(90deg,#F8C23A,#F6D15B)",
      cardBg: `linear-gradient(145deg,${palette[0]},${palette[1]},${palette[2] ?? palette[0]})`,
      border: `2px solid ${palette[0]}80`,
    },
    rara: {
      label: "⭐ Rara",
      glowColor: "#E85D2A",
      textColor: "#FFF1C7",
      badgeBg: "linear-gradient(90deg,#E85D2A,#B63822)",
      cardBg: `linear-gradient(145deg,${palette[0]},${palette[1]},${palette[2] ?? palette[0]})`,
      border: `2px solid ${palette[0]}80`,
    },
    comum: {
      label: "• Comum",
      glowColor: "rgba(255,241,199,0.3)",
      textColor: "#FFF1C7",
      badgeBg: "rgba(255,255,255,0.15)",
      cardBg: `linear-gradient(145deg,${palette[0]},${palette[1]},${palette[2] ?? palette[0]})`,
      border: `2px solid ${palette[0]}60`,
    },
  }[rarity];

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer"
      style={{
        perspective: 700,
        transform: visible ? `rotate(${rotation}deg)` : `rotate(${rotation}deg) scale(0)`,
        opacity: visible ? 1 : 0,
        transition: `transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${index * 120}ms, opacity 0.3s ease ${index * 120}ms`,
        willChange: "transform",
      }}
      onClick={!card.flipped && !card.flipping ? onFlip : undefined}
    >
      {/* Halo de raridade após flip */}
      {card.flipped && rarity === "brilhante" && (
        <div
          className="absolute inset-0 rounded-[18px] animate-pulse-gold"
          style={{ boxShadow: `0 0 24px 8px ${rarityConfig.glowColor}60`, zIndex: -1 }}
        />
      )}
      {card.flipped && rarity === "rara" && (
        <div
          className="absolute inset-0 rounded-[18px]"
          style={{ boxShadow: `0 0 16px 4px ${rarityConfig.glowColor}50`, zIndex: -1 }}
        />
      )}

      {/* Card 3D flip */}
      <div
        style={{
          width: 100,
          height: 145,
          transformStyle: "preserve-3d",
          transform: card.flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
        }}
      >
        {/* Verso */}
        <div
          className="absolute inset-0 rounded-[18px] flex items-center justify-center select-none"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "linear-gradient(135deg,#1a0d2e,#2d1a4e)",
            border: "2px solid #F8C23A60",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {/* Padrão do verso */}
          <div
            className="absolute inset-1 rounded-[14px]"
            style={{
              background: "repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(248,194,58,0.06) 8px,rgba(248,194,58,0.06) 16px)",
              border: "1px solid rgba(248,194,58,0.2)",
            }}
          />
          <span className="text-3xl relative z-10">🪗</span>
          <div
            className="absolute bottom-2 left-0 right-0 text-center"
            style={{ fontSize: 8, fontWeight: 900, color: "rgba(248,194,58,0.5)", letterSpacing: 2 }}
          >
            SANFONA
          </div>
          {!card.flipped && (
            <div
              className="absolute inset-0 rounded-[18px] flex items-end justify-center pb-2"
              style={{ background: "linear-gradient(to top, rgba(248,194,58,0.05), transparent)" }}
            >
              <span style={{ fontSize: 9, color: "rgba(248,194,58,0.4)", fontWeight: 700 }}>toque para revelar</span>
            </div>
          )}
        </div>

        {/* Frente */}
        <div
          className="absolute inset-0 rounded-[18px] flex flex-col items-center justify-between p-2 overflow-hidden select-none"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: rarityConfig.cardBg,
            border: rarityConfig.border,
          }}
        >
          {/* Badge duplicada */}
          {card.isDuplicate && (
            <div
              className="absolute top-1.5 right-1.5 rounded-full px-1.5"
              style={{ background: "rgba(0,0,0,0.5)", fontSize: 7, fontWeight: 900, color: "#F8C23A" }}
            >
              2×
            </div>
          )}

          {/* Número */}
          <div className="w-full flex justify-start">
            <span
              className="rounded-full px-1.5"
              style={{ fontSize: 8, fontWeight: 900, background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.8)" }}
            >
              #{Object.keys(STICKER_EMOJIS).indexOf(card.sticker.id) + 1}
            </span>
          </div>

          {/* Arte */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              fontSize: 32,
              background: "rgba(0,0,0,0.2)",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            {emoji}
          </div>

          {/* Nome */}
          <div className="w-full text-center">
            <p style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.9)", lineHeight: 1.2 }}>
              {card.sticker.name}
            </p>
            <p style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
              {card.sticker.category}
            </p>
          </div>

          {/* Badge de raridade */}
          <div
            className="rounded-full px-2 py-0.5 w-full text-center"
            style={{ background: rarityConfig.badgeBg, fontSize: 7, fontWeight: 900, color: rarityConfig.textColor }}
          >
            {rarityConfig.label}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function PackOpeningScreen({ onComplete, onOpenAnother, hasEnergy = true }: PackOpeningScreenProps) {
  const [phase, setPhase] = useState<OpeningPhase>("idle");
  const [cards, setCards] = useState<CardState[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [legendaryActive, setLegendaryActive] = useState(false);
  const [legendaryCardIdx, setLegendaryCardIdx] = useState<number | null>(null);
  const [shaking, setShaking] = useState(false);

  const packRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);
  const floatAnimRef = useRef<number>(0);
  const floatTRef = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ── Animação de flutuação ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "idle") return;
    const tick = () => {
      floatTRef.current += 0.022;
      const y = Math.sin(floatTRef.current) * 10;
      if (packRef.current) {
        packRef.current.style.transform = `translateY(${y}px)`;
      }
      floatAnimRef.current = requestAnimationFrame(tick);
    };
    floatAnimRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(floatAnimRef.current);
  }, [phase]);

  // ── Spawnar partículas ─────────────────────────────────────────────────────
  const spawnParticles = useCallback((
    count: number,
    color: string,
    type: Particle["type"],
    originX = 50,
    originY = 50,
  ) => {
    const newParticles: Particle[] = Array.from({ length: count }, () => {
      particleIdRef.current += 1;
      return {
        id: particleIdRef.current,
        x: originX + (Math.random() - 0.5) * 80,
        y: originY + (Math.random() - 0.5) * 40,
        size: 4 + Math.random() * 5,
        color,
        type,
        delay: Math.random() * 300,
        duration: 700 + Math.random() * 600,
      };
    });
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(
      () => setParticles((prev) => prev.filter((p) => !newParticles.find((n) => n.id === p.id))),
      2500,
    );
  }, []);

  // ── Fase 2+3: Toque → Rasgo ────────────────────────────────────────────────
  const handlePackClick = useCallback(() => {
    if (phaseRef.current !== "idle") return;
    setPhase("touched");
    vibrate(50);

    // escala do pack
    if (packRef.current) {
      packRef.current.style.transition = "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)";
      packRef.current.style.transform = "scale(1.1)";
    }

    // partículas douradas imediatas
    spawnParticles(8, "#F8C23A", "up", 195, 250);

    setTimeout(() => {
      setPhase("tearing");
      spawnParticles(18, "#F8C23A", "up", 195, 260);
      spawnParticles(6, "#F6D15B", "up", 195, 270);

      // depois do rasgo → reveal
      setTimeout(() => {
        // sortear 3 figurinhas reais
        const drawn: CardState[] = Array.from({ length: PACK_COUNT }, () => {
          const result = unlockRandomSticker();
          return { sticker: result.sticker, isDuplicate: result.isDuplicate, flipped: false, flipping: false };
        });
        setCards(drawn);
        setPhase("revealing");

        setTimeout(() => setCardsVisible(true), 80);
        setTimeout(() => setPhase("flipping"), 600);
      }, 500);
    }, 280);
  }, [spawnParticles]);

  // ── Fase 5: Flip individual ────────────────────────────────────────────────
  const handleCardFlip = useCallback((idx: number) => {
    if (phaseRef.current !== "flipping") return;
    setCards((prev) => {
      if (prev[idx].flipped || prev[idx].flipping) return prev;
      const next = prev.map((c, i) => i === idx ? { ...c, flipping: true } : c);
      return next;
    });

    vibrate(30);

    setTimeout(() => {
      setCards((prev) => {
        const card = prev[idx];
        if (!card) return prev;
        const next = prev.map((c, i) => i === idx ? { ...c, flipped: true, flipping: false } : c);

        // efeitos por raridade
        const { rarity } = card.sticker;
        if (rarity === "rara") {
          spawnParticles(10, "#E85D2A", "up", 130 + idx * 115, 320);
          setTimeout(() => spawnParticles(6, "#B63822", "up", 130 + idx * 115, 340), 200);
        }
        if (rarity === "brilhante") {
          setShaking(true);
          setTimeout(() => setShaking(false), 500);
          vibrate([80, 40, 80, 40, 160]);
          spawnParticles(20, "#F8C23A", "up", 130 + idx * 115, 320);
          setTimeout(() => spawnParticles(12, "#F6D15B", "spiral", 130 + idx * 115, 340), 150);
          setTimeout(() => spawnParticles(10, "#E85D2A", "up", 130 + idx * 115, 360), 300);
          setLegendaryCardIdx(idx);
          setTimeout(() => {
            setLegendaryActive(true);
            spawnParticles(30, "#F8C23A", "rain", 195, -10);
            setTimeout(() => spawnParticles(25, "#F6D15B", "rain", 195, -10), 400);
          }, 350);
        }

        // verifica conclusão
        const allFlipped = next.every((c) => c.flipped);
        if (allFlipped) setTimeout(() => setPhase("complete"), 800);

        return next;
      });
    }, 300); // metade do flip 3D
  }, [spawnParticles]);

  const dismissLegendary = useCallback(() => {
    setLegendaryActive(false);
    setLegendaryCardIdx(null);
  }, []);

  const flippedCount = cards.filter((c) => c.flipped).length;

  // ── Estados de exibição ────────────────────────────────────────────────────
  const showPack = phase === "idle" || phase === "touched" || phase === "tearing";
  const showCards = phase === "revealing" || phase === "flipping" || phase === "complete";

  return (
    <div
      ref={containerRef}
      className={cx(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden",
        shaking && "animate-shake",
      )}
      style={{ background: "linear-gradient(180deg,#0d0d1a 0%,#1a0a22 50%,#241512 100%)" }}
    >
      {/* Fundo estrelado */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {[...Array(28)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.7 ? 2 : 1,
              height: Math.random() > 0.7 ? 2 : 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      {/* Botão fechar */}
      <button
        onClick={onComplete}
        className="absolute top-5 right-5 z-[210] flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition"
        aria-label="Fechar"
      >
        <X size={18} />
      </button>

      {/* Partículas */}
      <Particles particles={particles} />

      {/* ── Overlay lendário ── */}
      {legendaryActive && (
        <div
          className="absolute inset-0 z-[190] flex flex-col items-center justify-center"
          style={{ background: "rgba(0,0,0,0.82)" }}
          onClick={dismissLegendary}
        >
          {/* Anéis de onda */}
          {[0, 1, 2].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border-2 border-milho"
              style={{
                width: 160,
                height: 160,
                animation: `wave-ring 1.2s ease-out ${r * 380}ms forwards`,
                opacity: 0,
              }}
            />
          ))}
          <div
            className="animate-glow-text mb-6 text-center"
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 6,
              color: "#F8C23A",
              textShadow: "0 0 20px #F8C23A, 0 0 40px #F8C23A",
            }}
          >
            ✦ BRILHANTE ✦
          </div>
          {legendaryCardIdx !== null && cards[legendaryCardIdx] && (
            <div
              className="relative flex flex-col items-center"
              style={{ transform: "scale(1.5)", animation: "pulse-scale 2s ease-in-out infinite" }}
            >
              <StickerCard
                card={cards[legendaryCardIdx]}
                index={1}
                visible
                onFlip={() => {}}
              />
            </div>
          )}
          <p className="mt-8 text-white/40 text-sm font-bold" style={{ fontSize: 13 }}>
            toque para continuar
          </p>
        </div>
      )}

      {/* ── Pack ── */}
      {showPack && (
        <div className="relative flex flex-col items-center z-10">
          <div
            ref={packRef}
            onClick={handlePackClick}
            onTouchEnd={(e) => { e.preventDefault(); handlePackClick(); }}
            className="relative cursor-pointer select-none"
            style={{ willChange: "transform" }}
          >
            {/* Glow pulsante */}
            <div
              className={cx(
                "absolute inset-0 rounded-3xl transition-all duration-300",
                phase === "touched" || phase === "tearing"
                  ? "opacity-100"
                  : "opacity-60 animate-pulse",
              )}
              style={{
                background: "radial-gradient(ellipse at center, rgba(248,194,58,0.35) 0%, transparent 70%)",
                transform: "scale(1.3)",
                filter: "blur(20px)",
              }}
            />

            {/* Pack card */}
            <div
              className="relative flex flex-col items-center justify-between overflow-hidden rounded-3xl select-none"
              style={{
                width: 168,
                height: 232,
                background: "linear-gradient(135deg,#c8a400 0%,#ffd700 30%,#ffe066 50%,#ffd700 70%,#8b6800 100%)",
                boxShadow: "0 0 40px rgba(248,194,58,0.5), 0 0 80px rgba(248,194,58,0.2), inset 0 0 30px rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.2)",
                transition: phase === "tearing" ? "transform 0.3s ease, opacity 0.3s ease" : undefined,
                transform: phase === "tearing" ? "translateY(-36px)" : undefined,
                opacity: phase === "tearing" ? 0 : 1,
              }}
            >
              {/* Padrão de fundo */}
              <div
                className="absolute inset-0"
                style={{
                  background: "repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(255,255,255,0.05) 12px,rgba(255,255,255,0.05) 24px)",
                }}
              />
              {/* Linhas de rasgo animadas */}
              {phase === "tearing" && (
                <>
                  <div className="absolute inset-x-0 animate-tear-line" style={{ top: "44%", height: 2, background: "linear-gradient(90deg, transparent, #fff8, transparent)" }} />
                  <div className="absolute inset-x-0 animate-tear-line2" style={{ top: "48%", height: 1, background: "linear-gradient(90deg, transparent, rgba(248,194,58,0.8), transparent)" }} />
                </>
              )}
              {/* Ícone central */}
              <div className="flex-1 flex items-center justify-center relative z-10">
                <span style={{ fontSize: 64, filter: "drop-shadow(0 0 8px rgba(255,200,0,0.8))" }}>🪗</span>
              </div>
              {/* Rodapé do pack */}
              <div
                className="relative z-10 w-full text-center py-3"
                style={{ background: "rgba(0,0,0,0.25)" }}
              >
                <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: 3, color: "rgba(255,255,255,0.9)" }}>
                  SANFONA DE OURO
                </p>
                <p style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
                  {PACK_COUNT} FIGURINHAS
                </p>
              </div>
            </div>
          </div>

          {/* Instrução */}
          {phase === "idle" && (
            <p
              className="mt-6 font-black animate-pulse"
              style={{ fontSize: 13, letterSpacing: 2, color: "rgba(248,194,58,0.7)" }}
            >
              Toque para abrir
            </p>
          )}
          {phase === "tearing" && (
            <p
              className="mt-6 font-black animate-pulse"
              style={{ fontSize: 13, letterSpacing: 2, color: "rgba(248,194,58,0.9)" }}
            >
              ✨ Revelando...
            </p>
          )}
        </div>
      )}

      {/* ── Cartas ── */}
      {showCards && (
        <div className="relative z-10 flex flex-col items-center gap-6 w-full px-4">
          {/* Contador */}
          <p style={{ fontSize: 12, color: "rgba(255,241,199,0.4)", fontWeight: 700, letterSpacing: 1 }}>
            {flippedCount < PACK_COUNT
              ? `${flippedCount}/${PACK_COUNT} reveladas — toque nas cartas`
              : "Todas reveladas! 🎉"}
          </p>

          {/* Linha de cartas */}
          <div className="flex items-end justify-center gap-3">
            {cards.map((card, idx) => (
              <StickerCard
                key={`${card.sticker.id}-${idx}`}
                card={card}
                index={idx}
                visible={cardsVisible}
                onFlip={() => handleCardFlip(idx)}
              />
            ))}
          </div>

          {/* Preview das figurinhas reveladas */}
          {phase === "complete" && (
            <div
              className="w-full max-w-sm rounded-2xl p-4 animate-fade-up"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-milho" />
                <p style={{ fontSize: 11, fontWeight: 900, color: "rgba(248,194,58,0.8)", letterSpacing: 1 }}>
                  ESTE PACOTE
                </p>
              </div>
              <div className="space-y-2">
                {cards.map((card, i) => {
                  const emoji = STICKER_EMOJIS[card.sticker.id] ?? "🎵";
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span style={{ fontSize: 20 }}>{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: 12, fontWeight: 900, color: "#FFF1C7", lineHeight: 1.2 }}>
                          {card.sticker.name}
                        </p>
                        <p style={{ fontSize: 10, color: "rgba(255,241,199,0.4)" }}>
                          {card.sticker.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="rounded-full px-2 py-0.5"
                          style={{
                            fontSize: 9,
                            fontWeight: 900,
                            background: card.sticker.rarity === "brilhante"
                              ? "rgba(248,194,58,0.2)"
                              : card.sticker.rarity === "rara"
                                ? "rgba(232,93,42,0.2)"
                                : "rgba(255,255,255,0.1)",
                            color: card.sticker.rarity === "brilhante"
                              ? "#F8C23A"
                              : card.sticker.rarity === "rara"
                                ? "#E85D2A"
                                : "rgba(255,241,199,0.5)",
                          }}
                        >
                          {card.sticker.rarity === "brilhante" ? "✨ Brilhante"
                            : card.sticker.rarity === "rara" ? "⭐ Rara" : "• Comum"}
                        </span>
                        {card.isDuplicate && (
                          <span
                            className="rounded-full px-1.5 py-0.5"
                            style={{ fontSize: 8, fontWeight: 900, background: "rgba(248,194,58,0.15)", color: "#F8C23A" }}
                          >
                            DUP
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botões de conclusão */}
          {phase === "complete" && (
            <div className="flex gap-3 w-full max-w-sm animate-fade-up">
              <button
                onClick={onComplete}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-black transition hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.1)", color: "#FFF1C7", fontSize: 14 }}
              >
                <Album size={16} /> Ver Álbum
              </button>
              {hasEnergy && onOpenAnother && (
                <button
                  onClick={onOpenAnother}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-black transition hover:bg-ouro"
                  style={{ background: "#F8C23A", color: "#7A2E17", fontSize: 14 }}
                >
                  <Sparkles size={16} /> Abrir Outro
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CSS de animações (injetado inline via style tag) ── */}
      <style>{`
        @keyframes particle-up {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-90px) scale(0); opacity: 0; }
        }
        @keyframes particle-rain {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(110px); opacity: 0; }
        }
        @keyframes particle-spiral {
          0%   { transform: rotate(0deg) translateX(0px) scale(1); opacity: 1; }
          100% { transform: rotate(360deg) translateX(50px) scale(0); opacity: 0; }
        }
        @keyframes wave-ring {
          0%   { transform: scale(0.5); opacity: 0.9; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 16px 4px rgba(248,194,58,0.5); }
          50%       { box-shadow: 0 0 32px 10px rgba(248,194,58,0.8); }
        }
        @keyframes glow-text {
          0%, 100% { text-shadow: 0 0 10px #F8C23A, 0 0 20px #F8C23A; }
          50%       { text-shadow: 0 0 24px #F8C23A, 0 0 48px #F8C23A, 0 0 72px #E85D2A; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%  { transform: translateX(-5px); }
          30%  { transform: translateX(5px); }
          45%  { transform: translateX(-4px); }
          60%  { transform: translateX(4px); }
          75%  { transform: translateX(-2px); }
          90%  { transform: translateX(2px); }
        }
        @keyframes tear-line {
          0%   { transform: scaleX(0); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes tear-line2 {
          0%   { transform: scaleX(0); opacity: 0; }
          30%  { opacity: 0.7; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes fade-up {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1.5); }
          50%       { transform: scale(1.6); }
        }
        .animate-particle-up      { animation: particle-up  var(--dur,900ms) ease-out var(--delay,0ms) forwards; }
        .animate-particle-rain    { animation: particle-rain var(--dur,1000ms) ease-in  var(--delay,0ms) forwards; }
        .animate-particle-spiral  { animation: particle-spiral var(--dur,900ms) ease-out var(--delay,0ms) forwards; }
        .animate-pulse-gold       { animation: pulse-gold 1.5s ease-in-out infinite; }
        .animate-glow-text        { animation: glow-text 1s ease-in-out infinite; }
        .animate-shake            { animation: shake 0.5s ease-out; }
        .animate-tear-line        { animation: tear-line  0.5s ease-out forwards; transform-origin: left center; }
        .animate-tear-line2       { animation: tear-line2 0.6s ease-out 80ms forwards; transform-origin: left center; }
        .animate-fade-up          { animation: fade-up 0.4s ease-out both; }
      `}</style>
    </div>
  );
}
