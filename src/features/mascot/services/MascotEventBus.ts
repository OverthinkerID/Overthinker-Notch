import type {
  MascotEventPayloadMap,
  MascotEventType,
} from "@/features/mascot/types/mascotTypes";

type PendengarEvent<K extends MascotEventType> = (
  payload: MascotEventPayloadMap[K]
) => void;

class MascotEventBusImpl {
  private pendengar = new Map<MascotEventType, Set<PendengarEvent<MascotEventType>>>();

  public langganan<K extends MascotEventType>(
    event: K,
    handler: PendengarEvent<K>
  ): () => void {
    let daftar = this.pendengar.get(event);
    if (!daftar) {
      daftar = new Set();
      this.pendengar.set(event, daftar);
    }
    const fungsi = handler as PendengarEvent<MascotEventType>;
    daftar.add(fungsi);
    return () => {
      daftar?.delete(fungsi);
    };
  }

  public pancarkan<K extends MascotEventType>(
    event: K,
    ...args: MascotEventPayloadMap[K] extends undefined
      ? []
      : [payload: MascotEventPayloadMap[K]]
  ): void {
    const daftar = this.pendengar.get(event);
    if (!daftar) return;
    const payload = args[0] as MascotEventPayloadMap[K];
    for (const handler of daftar) {
      handler(payload);
    }
  }

  public bersihkanSemua(): void {
    this.pendengar.clear();
  }
}

export const MascotEventBus = new MascotEventBusImpl();
