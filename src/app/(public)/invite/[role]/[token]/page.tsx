"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Smartphone, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const VALID_ROLES = ["caregiver", "family"];
const APP_PACKAGE = "com.habby_valle_15.zeloapp";
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${APP_PACKAGE}`;
const APP_STORE_URL = "https://apps.apple.com/app/zelo";

function getPlatform(): "android" | "ios" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  return "other";
}

export default function InvitePage() {
  const params = useParams();
  const role = params.role as string;
  const token = params.token as string;
  const platform = getPlatform();
  const [showFallback, setShowFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const deepLink = `zeloapp://invite/${role}/${token}`;
  const inviteUrl = typeof window !== "undefined" ? window.location.href : "";

  const androidIntentUrl = `intent://invite/${role}/${token}#Intent;scheme=zeloapp;package=${APP_PACKAGE};S.browser_fallback_url=${encodeURIComponent(inviteUrl || PLAY_STORE_URL)};end;`;

  const appUrl = platform === "android" ? androidIntentUrl : deepLink;

  useEffect(() => {
    if (!VALID_ROLES.includes(role)) {
      window.location.href = "/";
      return;
    }

    const handleVisibility = () => {
      if (document.hidden && timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };

    const handleBlur = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    timerRef.current = setTimeout(() => {
      setShowFallback(true);
    }, 2000);

    window.location.href = appUrl;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [role, token, appUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = inviteUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [inviteUrl]);

  if (!VALID_ROLES.includes(role)) return null;

  if (!showFallback) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">Abrindo o aplicativo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4">
        <Smartphone className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Voc&ecirc; foi convidado para o <span className="text-primary">Zelo</span>
        </h1>
        <p className="text-muted-foreground">
          Abra o aplicativo para criar sua conta e come&ccedil;ar a usar.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="min-w-[260px] text-base"
          onClick={() => {
            window.location.href = appUrl;
          }}
        >
          Abrir no App
        </Button>

        <Button variant="outline" size="lg" className="min-w-[260px]" onClick={copyLink}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Link copiado
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copiar link
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-6">
        <p className="text-sm font-medium">App n&atilde;o encontrado?</p>
        <p className="text-xs text-muted-foreground">
          Baixe o aplicativo Zelo na loja do seu dispositivo:
        </p>
        <div className="flex justify-center gap-3">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.806 1.626a1 1 0 010 1.732l-2.806 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
            </svg>
            Google Play
          </a>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            App Store
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          Depois de baixar, abra o link novamente ou use o c&oacute;digo de convite no app.
        </p>
      </div>
    </div>
  );
}
