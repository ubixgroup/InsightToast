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
