import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import {
  MASCOT_ANIMATION_STATES,
  type MascotAnimationState,
  type MascotCharacterId,
} from "@/features/mascot/types/mascotTypes";
import { useMascotStore } from "@/features/mascot/stores/useMascotStore";

// Palet Warna Resmi Overthinker Living Mascot:
// Panna Cotta (50%): #F1E4D0 | Ivy Lacquer (35%): #344C3D | Marinara Red (10%): #A83235
// Supporting (5%): Deep Navy #101521, Soft Sage #C5D4C5, Warm White #FFF8ED
export const PALET_MASCOT_RESMI = {
  pannaCotta: "#F1E4D0",
  ivyLacquer: "#344C3D",
  marinaraRed: "#A83235",
  deepNavy: "#101521",
  softSage: "#C5D4C5",
  warmWhite: "#FFF8ED",
} as const;

interface PropsRiveMascotCanvas {
  ukuranPx?: number;
  sumberRivLokal?: string;
  karakterOverride?: MascotCharacterId;
}

function RiveBinaryHost({
  sumberRivLokal,
  ukuranPx,
}: {
  sumberRivLokal: string;
  ukuranPx: number;
}) {
  const stateAktif = useMascotStore((s) => s.stateAktif);
  const mataVektor = useMascotStore((s) => s.mataVektor);
  const mulutTerbuka = useMascotStore((s) => s.mulutTerbuka);
  const audioTelemetri = useMascotStore((s) => s.audioTelemetri);

  const { rive, RiveComponent } = useRive({
    src: sumberRivLokal,
    stateMachines: "MascotStateMachine",
    autoplay: true,
  });

  const inputState = useStateMachineInput(rive, "MascotStateMachine", "stateIndex");
  const inputEyeX = useStateMachineInput(rive, "MascotStateMachine", "eyeX");
  const inputEyeY = useStateMachineInput(rive, "MascotStateMachine", "eyeY");
  const inputMouth = useStateMachineInput(rive, "MascotStateMachine", "mouthOpen");
  const inputAudio = useStateMachineInput(rive, "MascotStateMachine", "audioIntensity");

  useEffect(() => {
    if (inputState) {
      inputState.value = MASCOT_ANIMATION_STATES.indexOf(stateAktif);
    }
    if (inputEyeX) inputEyeX.value = mataVektor.x;
    if (inputEyeY) inputEyeY.value = mataVektor.y;
    if (inputMouth) inputMouth.value = mulutTerbuka;
    if (inputAudio) inputAudio.value = audioTelemetri.intensitas;
  }, [
    stateAktif,
    mataVektor,
    mulutTerbuka,
    audioTelemetri.intensitas,
    inputState,
    inputEyeX,
    inputEyeY,
    inputMouth,
    inputAudio,
  ]);

  return (
    <div style={{ width: ukuranPx, height: ukuranPx }}>
      <RiveComponent />
    </div>
  );
}

function renderSvgKarakter(
  karakter: MascotCharacterId,
  stateAktif: MascotAnimationState,
  pupilX: number,
  pupilY: number,
  tinggiMata: number,
  tinggiMulut: number
) {
  if (karakter === "hush_puppy") {
    return (
      <svg
        viewBox="0 0 80 80"
        className="relative z-10 h-full w-full"
        role="img"
        aria-label={`Hush Puppy (${stateAktif})`}
      >
        {/* Ekor bergoyang saat happy / celebrating / music_reaction */}
        <path
          d={
            stateAktif === "happy" ||
            stateAktif === "celebrating" ||
            stateAktif === "music_reaction"
              ? "M63 54 Q73 46 69 38"
              : "M63 58 Q70 55 68 49"
          }
          stroke={PALET_MASCOT_RESMI.ivyLacquer}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Telinga panjang Basset Hound (Ivy Lacquer 35%) */}
        <ellipse
          cx="15"
          cy="44"
          rx="8"
          ry="19"
          transform={stateAktif === "happy" ? "rotate(-8 15 44)" : undefined}
          fill={PALET_MASCOT_RESMI.ivyLacquer}
        />
        <ellipse
          cx="65"
          cy="44"
          rx="8"
          ry="19"
          transform={stateAktif === "happy" ? "rotate(8 65 44)" : undefined}
          fill={PALET_MASCOT_RESMI.ivyLacquer}
        />
        {/* Kepala Utama (Panna Cotta 50%) */}
        <rect
          x="18"
          y="16"
          width="44"
          height="46"
          rx="20"
          fill={PALET_MASCOT_RESMI.pannaCotta}
          stroke={PALET_MASCOT_RESMI.ivyLacquer}
          strokeWidth="1.6"
        />
        {/* Mata Ekspresif */}
        <rect
          x={26 + pupilX}
          y={35 - tinggiMata / 2 + pupilY}
          width="8.5"
          height={tinggiMata}
          rx="4"
          fill={PALET_MASCOT_RESMI.deepNavy}
        />
        <circle
          cx={30.2 + pupilX}
          cy={35 + pupilY}
          r={tinggiMata > 4 ? 2 : 1}
          fill={PALET_MASCOT_RESMI.marinaraRed}
        />
        <rect
          x={45.5 + pupilX}
          y={35 - tinggiMata / 2 + pupilY}
          width="8.5"
          height={stateAktif === "confused" ? tinggiMata * 0.72 : tinggiMata}
          rx="4"
          fill={PALET_MASCOT_RESMI.deepNavy}
        />
        <circle
          cx={49.7 + pupilX}
          cy={35 + pupilY}
          r={tinggiMata > 4 ? 2 : 1}
          fill={PALET_MASCOT_RESMI.marinaraRed}
        />
        {/* Hidung & Kalung Aksen Marinara Red (10%) */}
        <ellipse
          cx="40"
          cy="46"
          rx="5"
          ry="3.5"
          fill={PALET_MASCOT_RESMI.deepNavy}
        />
        <rect
          x="33"
          y={54 - tinggiMulut / 2}
          width="14"
          height={tinggiMulut}
          rx="1.5"
          fill={PALET_MASCOT_RESMI.ivyLacquer}
        />
        <rect
          x="26"
          y="63"
          width="28"
          height="4"
          rx="2"
          fill={PALET_MASCOT_RESMI.marinaraRed}
        />
      </svg>
    );
  }

  if (karakter === "little_companion") {
    return (
      <svg
        viewBox="0 0 80 80"
        className="relative z-10 h-full w-full"
        role="img"
        aria-label={`Little Companion (${stateAktif})`}
      >
        {/* Topi / Rambut Bergaya (Ivy Lacquer 35%) */}
        <path
          d="M16 36 C16 14 64 14 64 36 L60 28 C52 22 28 22 20 28 Z"
          fill={PALET_MASCOT_RESMI.ivyLacquer}
        />
        {/* Pin Aksen Marinara Red (10%) */}
        <circle cx="54" cy="21" r="3" fill={PALET_MASCOT_RESMI.marinaraRed} />
        {/* Wajah Digital Bergaya (Panna Cotta 50%) */}
        <rect
          x="19"
          y="22"
          width="42"
          height="44"
          rx="19"
          fill={PALET_MASCOT_RESMI.pannaCotta}
          stroke={PALET_MASCOT_RESMI.ivyLacquer}
          strokeWidth="1.5"
        />
        {/* Mata Ekspresif */}
        <rect
          x={26 + pupilX}
          y={39 - tinggiMata / 2 + pupilY}
          width="8.5"
          height={tinggiMata}
          rx="4"
          fill={PALET_MASCOT_RESMI.deepNavy}
        />
        <circle
          cx={30.2 + pupilX}
          cy={39 + pupilY}
          r={tinggiMata > 4 ? 2.1 : 1}
          fill={PALET_MASCOT_RESMI.marinaraRed}
        />
        <rect
          x={45.5 + pupilX}
          y={39 - tinggiMata / 2 + pupilY}
          width="8.5"
          height={stateAktif === "confused" ? tinggiMata * 0.72 : tinggiMata}
          rx="4"
          fill={PALET_MASCOT_RESMI.deepNavy}
        />
        <circle
          cx={49.7 + pupilX}
          cy={39 + pupilY}
          r={tinggiMata > 4 ? 2.1 : 1}
          fill={PALET_MASCOT_RESMI.marinaraRed}
        />
        {/* Rona Pipi Soft Sage / Warm White & Mulut */}
        <circle
          cx="25"
          cy="49"
          r="3"
          fill={PALET_MASCOT_RESMI.marinaraRed}
          fillOpacity="0.22"
        />
        <circle
          cx="55"
          cy="49"
          r="3"
          fill={PALET_MASCOT_RESMI.marinaraRed}
          fillOpacity="0.22"
        />
        <rect
          x="33"
          y={54 - tinggiMulut / 2}
          width="14"
          height={tinggiMulut}
          rx="1.5"
          fill={PALET_MASCOT_RESMI.ivyLacquer}
        />
      </svg>
    );
  }

  // Default: Overthinker Robot (Hybrid 2.5D Holographic Head)
  return (
    <svg
      viewBox="0 0 80 80"
      className="relative z-10 h-full w-full"
      role="img"
      aria-label={`Overthinker Robot (${stateAktif})`}
    >
      <defs>
        <linearGradient id="ivyShell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PALET_MASCOT_RESMI.ivyLacquer} />
          <stop offset="100%" stopColor={PALET_MASCOT_RESMI.deepNavy} />
        </linearGradient>
        <linearGradient id="pannaFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PALET_MASCOT_RESMI.warmWhite} />
          <stop offset="55%" stopColor={PALET_MASCOT_RESMI.pannaCotta} />
          <stop offset="100%" stopColor={PALET_MASCOT_RESMI.softSage} />
        </linearGradient>
      </defs>

      <rect
        x="14"
        y="10"
        width="52"
        height="60"
        rx="22"
        fill="url(#ivyShell)"
        stroke={PALET_MASCOT_RESMI.softSage}
        strokeOpacity="0.45"
        strokeWidth="1.4"
      />
      <rect
        x="8"
        y="30"
        width="5"
        height="18"
        rx="2.5"
        fill={PALET_MASCOT_RESMI.ivyLacquer}
        stroke={PALET_MASCOT_RESMI.softSage}
        strokeWidth="0.9"
      />
      <rect
        x="67"
        y="30"
        width="5"
        height="18"
        rx="2.5"
        fill={PALET_MASCOT_RESMI.ivyLacquer}
        stroke={PALET_MASCOT_RESMI.softSage}
        strokeWidth="0.9"
      />
      <rect
        x="35"
        y="14"
        width="10"
        height="2.5"
        rx="1.25"
        fill={PALET_MASCOT_RESMI.marinaraRed}
      />
      <path
        d="M22 20 L28 20 L31 23 M58 20 L52 20 L49 23"
        stroke={PALET_MASCOT_RESMI.softSage}
        strokeOpacity="0.6"
        strokeWidth="1"
        fill="none"
      />
      <rect
        x="19"
        y="21"
        width="42"
        height="42"
        rx="15"
        fill="url(#pannaFace)"
        fillOpacity="0.92"
        stroke={PALET_MASCOT_RESMI.warmWhite}
        strokeOpacity="0.6"
        strokeWidth="1"
      />
      <g>
        <rect
          x={25 + pupilX}
          y={38 - tinggiMata / 2 + pupilY}
          width="9.5"
          height={tinggiMata}
          rx="4"
          fill={PALET_MASCOT_RESMI.deepNavy}
        />
        <circle
          cx={29.75 + pupilX}
          cy={38 + pupilY}
          r={tinggiMata > 4 ? 2.4 : 1.2}
          fill={PALET_MASCOT_RESMI.marinaraRed}
        />
        <rect
          x={45.5 + pupilX}
          y={38 - tinggiMata / 2 + pupilY}
          width="9.5"
          height={stateAktif === "confused" ? tinggiMata * 0.72 : tinggiMata}
          rx="4"
          fill={PALET_MASCOT_RESMI.deepNavy}
        />
        <circle
          cx={50.25 + pupilX}
          cy={38 + pupilY}
          r={tinggiMata > 4 ? 2.4 : 1.2}
          fill={PALET_MASCOT_RESMI.marinaraRed}
        />
      </g>
      {stateAktif === "listening" && (
        <path
          d="M4 33 Q1 39 4 45"
          stroke={PALET_MASCOT_RESMI.pannaCotta}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}
      <rect
        x="33"
        y={53 - tinggiMulut / 2}
        width="14"
        height={tinggiMulut}
        rx="1.5"
        fill={PALET_MASCOT_RESMI.ivyLacquer}
        opacity={stateAktif === "sleepy" ? 0.55 : 0.9}
      />
    </svg>
  );
}

export function RiveMascotCanvas({
  ukuranPx = 64,
  sumberRivLokal,
  karakterOverride,
}: PropsRiveMascotCanvas) {
  const stateAktif = useMascotStore((s) => s.stateAktif);
  const sedangBerkedip = useMascotStore((s) => s.sedangBerkedip);
  const mataVektor = useMascotStore((s) => s.mataVektor);
  const mulutTerbuka = useMascotStore((s) => s.mulutTerbuka);
  const audioTelemetri = useMascotStore((s) => s.audioTelemetri);
  const pengaturan = useMascotStore((s) => s.pengaturan);

  if (sumberRivLokal) {
    return (
      <RiveBinaryHost
        sumberRivLokal={sumberRivLokal}
        ukuranPx={ukuranPx}
      />
    );
  }

  const karakter = karakterOverride ?? pengaturan.selectedCharacter;
  const nonaktifAnimasi =
    pengaturan.reducedMotion || stateAktif === "minimized";

  const faktorIntensitas = nonaktifAnimasi ? 0 : pengaturan.animationIntensity;

  const offsetKepalaX =
    stateAktif === "look_left"
      ? -4.5 * faktorIntensitas
      : stateAktif === "look_right"
        ? 4.5 * faktorIntensitas
        : mataVektor.x * 2.8 * faktorIntensitas;

  const offsetKepalaY =
    stateAktif === "music_reaction" && audioTelemetri.aktif
      ? -audioTelemetri.frekuensiRendah * 3.5 * faktorIntensitas
      : stateAktif === "thinking" || stateAktif === "searching_lyrics"
        ? -2 * faktorIntensitas
        : mataVektor.y * 2.2 * faktorIntensitas;

  const rotasiKepala =
    stateAktif === "confused"
      ? -7 * faktorIntensitas
      : stateAktif === "celebrating"
        ? 5 * faktorIntensitas
        : stateAktif === "music_reaction" && audioTelemetri.aktif
          ? (audioTelemetri.frekuensiMenengah - 0.5) * 6 * faktorIntensitas
          : mataVektor.x * 3 * faktorIntensitas;

  const pupilX =
    stateAktif === "look_left"
      ? -3
      : stateAktif === "look_right" || stateAktif === "reading_lyrics"
        ? 2.5
        : mataVektor.x * 2.8;
  const pupilY =
    stateAktif === "thinking" || stateAktif === "searching_lyrics"
      ? -2
      : mataVektor.y * 2.2;

  const tinggiMata =
    sedangBerkedip || stateAktif === "blink"
      ? 1.5
      : stateAktif === "sleepy" || stateAktif === "minimized"
        ? 3.5
        : stateAktif === "surprised"
          ? 11
          : stateAktif === "happy" || stateAktif === "celebrating"
            ? 5.5
            : 8.5;

  const tinggiMulut =
    stateAktif === "talking" || stateAktif === "reading_lyrics"
      ? 2.5 + mulutTerbuka * 5
      : stateAktif === "surprised"
        ? 7
        : stateAktif === "happy" || stateAktif === "celebrating"
          ? 4.5
          : 2;

  return (
    <motion.div
      data-testid="living-mascot-canvas"
      data-state={stateAktif}
      data-character={karakter}
      className="relative flex items-center justify-center select-none"
      style={{ width: ukuranPx, height: ukuranPx }}
      animate={{
        x: offsetKepalaX,
        y: offsetKepalaY,
        rotate: rotasiKepala,
        opacity: stateAktif === "sleepy" || stateAktif === "minimized" ? 0.78 : 1,
        scale:
          stateAktif === "surprised"
            ? 1.05
            : stateAktif === "music_reaction" && audioTelemetri.aktif
              ? 1 + audioTelemetri.intensitas * 0.04
              : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 200 * pengaturan.animationSpeed,
        damping: 20,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-1 rounded-full blur-md opacity-45"
        style={{
          background: `radial-gradient(circle, ${PALET_MASCOT_RESMI.pannaCotta}44 0%, ${PALET_MASCOT_RESMI.ivyLacquer}55 65%, transparent 100%)`,
        }}
      />

      {!nonaktifAnimasi && (
        <>
          <motion.span
            aria-hidden="true"
            className="absolute top-0.5 right-1.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: PALET_MASCOT_RESMI.warmWhite }}
            animate={{ y: [-1.5, 1.5, -1.5], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute bottom-1 left-1.5 h-1 w-1 rounded-full"
            style={{ backgroundColor: PALET_MASCOT_RESMI.softSage }}
            animate={{ y: [1.5, -1.5, 1.5], opacity: [0.3, 0.85, 0.3] }}
            transition={{ duration: 3.1, repeat: Infinity }}
          />
        </>
      )}

      {renderSvgKarakter(
        karakter,
        stateAktif,
        pupilX,
        pupilY,
        tinggiMata,
        tinggiMulut
      )}
    </motion.div>
  );
}
