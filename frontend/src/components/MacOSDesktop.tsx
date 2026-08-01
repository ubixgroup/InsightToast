import { useEffect, useRef } from "react";

export interface DesktopFile {
    name: string;
    content: { url: string; thumbnail: string };
}

interface MacOSDesktopProps {
    desktopFiles?: DesktopFile[];
}

// Extend Window to include the mountMacOS global from the macos-demo bundle
declare global {
    interface Window {
        mountMacOS?: (container: HTMLElement, options?: { desktopFiles?: DesktopFile[] }) => void;
    }
}

let scriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;
let cssLoaded = false;
let pdfJsLoaded = false;
let pdfJsLoadPromise: Promise<void> | null = null;

const PDFJS_VERSION = "4.9.155";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

/** Load pdfjs-dist from CDN once (sets globalThis.pdfjsLib) */
function loadPdfJs(): Promise<void> {
    if (pdfJsLoaded) return Promise.resolve();
    if (pdfJsLoadPromise) return pdfJsLoadPromise;
    pdfJsLoadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "module";
        script.src = `${PDFJS_CDN}/pdf.min.mjs`;
        script.onload = () => {
            const lib = (globalThis as Record<string, unknown>).pdfjsLib as
                | { GlobalWorkerOptions: { workerSrc: string } }
                | undefined;
            if (lib) {
                lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.mjs`;
            }
            pdfJsLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load pdf.js from CDN"));
        document.head.appendChild(script);
    });
    return pdfJsLoadPromise;
}

/** Load the macos-demo CSS once from public/macos-demo/ */
function loadMacOSStyles(): void {
    if (cssLoaded) return;
    cssLoaded = true;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/macos-demo/index.css";
    document.head.appendChild(link);
}

/** Load the macos-demo bundle once (sets window.mountMacOS) */
function loadMacOSScript(): Promise<void> {
    if (scriptLoaded && window.mountMacOS) return Promise.resolve();
    if (scriptLoadPromise) return scriptLoadPromise;
    scriptLoadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "/macos-demo/index.js";
        script.async = true;
        script.onload = () => {
            scriptLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error("Failed to load macos-demo script"));
        document.head.appendChild(script);
    });
    return scriptLoadPromise;
}

/**
 * Embeds the macOS desktop replica into a React component.
 *
 * The macos-demo bundle (index.js) exposes `window.mountMacOS(el)` which
 * renders the macOS desktop simulation into the given DOM element using its
 * own custom virtual-DOM framework (independent of React).
 *
 * On unmount the container is cleared which tears down the macOS demo.
 */
export default function MacOSDesktop({ desktopFiles }: MacOSDesktopProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let cancelled = false;

        loadMacOSStyles();
        loadPdfJs().catch(() => { /* pdf.js load failed */ });
        loadMacOSScript().then(() => {
            if (cancelled || !el || mountedRef.current) return;
            if (window.mountMacOS) {
                window.mountMacOS(el, { desktopFiles: desktopFiles ?? [] });
                mountedRef.current = true;
            }
        });

        return () => {
            cancelled = true;
            mountedRef.current = false;
            if (el) {
                while (el.firstChild) el.removeChild(el.firstChild);
            }
        };
    }, [desktopFiles]);

    return (
        <div
            ref={containerRef}
            className="macos-demo-root"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
            }}
        />
    );
}
