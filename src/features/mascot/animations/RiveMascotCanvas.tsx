import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { MASCOT_ANIMATION_STATES } from "@/features/mascot/types/mascotTypes";
import { useMascotStore } from "@/features/mascot/stores/useMascotStore";

interface PropsRiveMascotCanvas {
  ukuranPx?: number;
  sumberRivLokal?: string;
}

// Adapter Rive State Machine lokal (aktif otomatis saat aset .riv lokal tersedia)
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

export function RiveMascotCanvas({
  ukuranPx = 64,
  sumberRivLokal,
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

  const faktorIntensitas = pengaturan.reducedMotion
    ? 0
    : pengaturan.animationIntensity;

  const offsetKepalaX =
    stateAktif === "look_left"
      ? -5 * faktorIntensitas
      : stateAktif === "look_right"
        ? 5 * faktorIntensitas
        : mataVektor.x * 3 * faktorIntensitas;

  const offsetKepalaY =
    stateAktif === "music_reaction" && audioTelemetri.aktif
      ? -audioTelemetri.frekuensiRendah * 4 * faktorIntensitas
      : mataVektor.y * 2.5 * faktorIntensitas;

  const rotasiKepala =
    stateAktif === "confused"
      ? -8 * faktorIntensitas
      : stateAktif === "celebrating"
        ? 6 * faktorIntensitas
        : stateAktif === "music_reaction" && audioTelemetri.aktif
          ? (audioTelemetri.frekuensiMenengah - 0.5) * 8 * faktorIntensitas
          : mataVektor.x * 4 * faktorIntensitas;

  const pupilX =
    stateAktif === "look_left"
      ? -3.5
      : stateAktif === "look_right"
        ? 3.5
        : mataVektor.x * 3.2;
  const pupilY = mataVektor.y * 2.4;

  const tinggiMata =
    sedangBerkedip || stateAktif === "blink"
      ? 1.5
      : stateAktif === "sleepy"
        ? 4
        : stateAktif === "surprised"
          ? 12
          : stateAktif === "happy" || stateAktif === "celebrating"
            ? 6
            : 9;

  const warnaAksen =
    stateAktif === "confused"
      ? "#F59E0B"
      : stateAktif === "celebrating" || stateAktif === "music_reaction"
        ? "#66E5D2"
        : stateAktif === "focused"
          ? "#A879FF"
          : "#55A7FF";

  const tinggiMulut =
    stateAktif === "talking"
      ? 3 + mulutTerbuka * 7
      : stateAktif === "surprised"
        ? 8
        : stateAktif === "happy" || stateAktif === "celebrating"
          ? 5
          : 2.5;

  return (
    <motion.div
      data-testid="living-mascot-canvas"
      data-state={stateAktif}
      className="relative flex items-center justify-center select-none"
      style={{ width: ukuranPx, height: ukuranPx }}
      animate={{
        x: offsetKepalaX,
        y: offsetKepalaY,
        rotate: rotasiKepala,
        scale:
          stateAktif === "surprised"
            ? 1.06
            : stateAktif === "music_reaction" && audioTelemetri.aktif
              ? 1 + audioTelemetri.intensitas * 0.05
              : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 220 * pengaturan.animationSpeed,
        damping: 18,
      }}
    >
      {/* Purple & Cyan Ambient Holographic Glow */}
      <div
        aria-hidden="true"
        className="absolute inset-1 rounded-full blur-md opacity-55 transition-colors duration-300"
        style={{
          background: `radial-gradient(circle, ${warnaAksen}55 0%, #A879FF40 60%, transparent 100%)`,
        }}
      />

      {/* Holographic Particles */}
      {!pengaturan.reducedMotion && (
        <>
          <motion.span
            aria-hidden="true"
            className="absolute -top-0.5 right-1 h-1.5 w-1.5 rounded-full bg-[#66E5D2]"
            animate={{ y: [-2, 2, -2], opacity: [0.4, 0.95, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute bottom-0.5 left-1 h-1 w-1 rounded-full bg-[#A879FF]"
            animate={{ y: [2, -2, 2], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 2.9, repeat: Infinity }}
          />
        </>
      )}

      {/* Futuristic AI Robot Head SVG */}
      <svg
        viewBox="0 0 80 80"
        className="relative z-10 h-full w-full drop-shadow-[0_0_8px_rgba(85,167,255,0.45)]"
        role="img"
        aria-label={`Overthinker Living Mascot (${stateAktif})`}
      >
        <defs>
          <linearGradient id="headShell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1B2438" />
            <stop offset="100%" stopColor="#0E1320" />
          </linearGradient>
          <linearGradient id="visorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0A101D" />
            <stop offset="100%" stopColor="#151E33" />
          </linearGradient>
        </defs>

        {/* Antena */}
        <line
          x1="40"
          y1="8"
          x2="40"
          y2="16"
          stroke={warnaAksen}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="40" cy="6.5" r="3" fill="#66E5D2" />

        {/* Cangkang Kepala */}
        <rect
          x="13"
          y="16"
          width="54"
          height="48"
          rx="16"
          fill="url(#headShell)"
          stroke={warnaAksen}
          strokeWidth="2"
        />

        {/* Ear Pods */}
        <rect x="7" y="31" width="5" height="18" rx="2.5" fill="#A879FF" />
        <rect x="68" y="31" width="5" height="18" rx="2.5" fill="#A879FF" />

        {/* Visor Kaca */}
        <rect
          x="19"
          y="23"
          width="42"
          height="28"
          rx="10"
          fill="url(#visorGrad)"
          stroke="#55A7FF55"
          strokeWidth="1.2"
        />

        {/* Mata Kiri & Kanan dengan Kelopak */}
        <rect
          x={26 + pupilX}
          y={36 - tinggiMata / 2 + pupilY}
          width="9"
          height={tinggiMata}
          rx="4"
          fill={warnaAksen}
        />
        <rect
          x={45 + pupilX}
          y={36 - tinggiMata / 2 + pupilY}
          width="9"
          height={tinggiMata}
          rx="4"
          fill={warnaAksen}
        />

        {/* Mulut Animasi */}
        <rect
          x="32"
          y={55 - tinggiMulut / 2}
          width="16"
          height={tinggiMulut}
          rx="2"
          fill="#66E5D2"
          opacity={stateAktif === "sleepy" ? 0.45 : 0.92}
        />
      </svg>
    </motion.div>
  );
}
