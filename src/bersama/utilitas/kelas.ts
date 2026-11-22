import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function gabungKelas(...daftarKelas: ClassValue[]): string {
  return twMerge(clsx(daftarKelas));
}
