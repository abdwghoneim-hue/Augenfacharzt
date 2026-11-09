import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-end p-4">
        <ThemeToggle />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <div className="animate-fade-in-up mb-8 flex flex-col items-center gap-3 text-center">
          <Image
            src="/branding/daog-eye-mark.png"
            alt="Deutsch-Arabische Ophthalmologische Gesellschaft"
            width={66}
            height={36}
            className="opacity-90 transition-opacity hover:opacity-100"
          />
          <div>
            <Link href="/" className="text-xl font-normal tracking-tight text-foreground hover:text-accent transition-colors">
              AugenFacharzt
            </Link>
            <p className="font-mono text-xs text-muted uppercase tracking-wider mt-0.5">
              Mündliche Prüfung – Lernplattform
            </p>
          </div>
        </div>

        <div className="animate-scale-in w-full max-w-md">{children}</div>

        {/* Medical Direction & Concept Endorsement Card (High Contrast & Clear) */}
        <div className="animate-fade-in mt-8 w-full max-w-md rounded-2xl border border-border bg-surface-elevated/70 p-4 shadow-md backdrop-blur-sm transition-all hover:border-accent/50">
          <div className="flex items-center gap-3.5">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border-2 border-accent/40 bg-[#07131e] shadow-md">
              <Image
                src="/branding/dr-ghunaim-emblem-sharp.png"
                alt="Dr. Abdelhamid Ghunaim"
                fill
                priority
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Dr. Abdelhamid Ghunaim
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  <Sparkles className="size-2.5" />
                  Ophthalmology
                </span>
              </div>
              <p className="text-xs text-muted font-medium mt-0.5">
                Wissenschaftliche Leitung & Plattformkonzept
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
