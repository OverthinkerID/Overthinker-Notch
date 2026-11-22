import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface PropertiBatasGalat {
  children: ReactNode;
}

interface KondisiBatasGalat {
  terjadiGalat: boolean;
  pesanGalat: string;
}

export class BatasGalat extends Component<PropertiBatasGalat, KondisiBatasGalat> {
  public constructor(props: PropertiBatasGalat) {
    super(props);
    this.state = {
      terjadiGalat: false,
      pesanGalat: "",
    };
  }

  public static getDerivedStateFromError(galat: Error): KondisiBatasGalat {
    return {
      terjadiGalat: true,
      pesanGalat: galat.message || "Ada error tak terduga di tampilan.",
    };
  }

  public componentDidCatch(galat: Error, info: ErrorInfo): void {
    console.error("[BatasGalat] Error tertangkap:", galat, info.componentStack);
  }

  private pulihkanTampilan = (): void => {
    this.setState({ terjadiGalat: false, pesanGalat: "" });
  };

  public render(): ReactNode {
    if (this.state.terjadiGalat) {
      return (
        <div
          role="alert"
          className="flex min-h-screen items-center justify-center p-6 latar-futuristik"
        >
          <div className="permukaan-kaca-angkat max-w-md w-full rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-[var(--aksen-bahaya)]">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h2 className="text-base font-semibold">
                Ups, ada error di tampilan
              </h2>
            </div>
            <p className="text-sm text-[var(--warna-teks-sekunder)] leading-relaxed">
              {this.state.pesanGalat}
            </p>
            <button
              type="button"
              onClick={this.pulihkanTampilan}
              className="inline-flex items-center gap-2 rounded-xl bg-[#55A7FF] px-4 py-2 text-sm font-medium text-[#0B1120] transition hover:brightness-110"
            >
              <RotateCcw className="h-4 w-4" />
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
