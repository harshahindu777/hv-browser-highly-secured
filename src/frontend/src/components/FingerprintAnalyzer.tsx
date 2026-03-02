import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";

type RiskLevel = "Low" | "Medium" | "High";

interface FingerprintItem {
  label: string;
  value: string;
  risk: RiskLevel;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "unavailable";
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("PrivacyShield v2", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("PrivacyShield v2", 4, 17);
    const dataURL = canvas.toDataURL();
    const hash = hashString(dataURL);
    return `${hash.substring(0, 16)}...`;
  } catch {
    return "blocked";
  }
}

function getWebGLInfo(): { renderer: string; vendor: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return { renderer: "unavailable", vendor: "unavailable" };
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return { renderer: "hidden", vendor: "hidden" };
    return {
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "unknown",
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "unknown",
    };
  } catch {
    return { renderer: "error", vendor: "error" };
  }
}

function collectFingerprint(): FingerprintItem[] {
  const webgl = getWebGLInfo();
  const canvasHash = getCanvasFingerprint();
  const plugins = navigator.plugins ? navigator.plugins.length : 0;
  const touchPoints = navigator.maxTouchPoints || 0;

  return [
    {
      label: "User Agent",
      value: navigator.userAgent,
      risk: "High",
    },
    {
      label: "Screen Resolution",
      value: `${screen.width}×${screen.height} @ ${screen.colorDepth}bpp`,
      risk: screen.width > 1920 ? "Medium" : "Low",
    },
    {
      label: "Timezone",
      value: Intl.DateTimeFormat().resolvedOptions().timeZone,
      risk: "Medium",
    },
    {
      label: "Language",
      value:
        navigator.language +
        (navigator.languages
          ? ` [${navigator.languages.slice(0, 3).join(", ")}]`
          : ""),
      risk: "Low",
    },
    {
      label: "Do Not Track",
      value:
        navigator.doNotTrack === "1"
          ? "Enabled"
          : navigator.doNotTrack === "0"
            ? "Disabled"
            : "Unset",
      risk: navigator.doNotTrack === "1" ? "Low" : "Medium",
    },
    {
      label: "Cookies Enabled",
      value: navigator.cookieEnabled ? "Yes" : "No",
      risk: navigator.cookieEnabled ? "Medium" : "Low",
    },
    {
      label: "JavaScript",
      value: "Enabled (active)",
      risk: "High",
    },
    {
      label: "Canvas Fingerprint",
      value: canvasHash,
      risk: canvasHash === "blocked" ? "Low" : "High",
    },
    {
      label: "WebGL Renderer",
      value: webgl.renderer,
      risk:
        webgl.renderer === "hidden" || webgl.renderer === "unavailable"
          ? "Low"
          : "High",
    },
    {
      label: "WebGL Vendor",
      value: webgl.vendor,
      risk:
        webgl.vendor === "hidden" || webgl.vendor === "unavailable"
          ? "Low"
          : "Medium",
    },
    {
      label: "CPU Cores",
      value: navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} logical cores`
        : "unavailable",
      risk: "Medium",
    },
    {
      label: "Device Memory",
      value: (navigator as Navigator & { deviceMemory?: number }).deviceMemory
        ? `${(navigator as Navigator & { deviceMemory?: number }).deviceMemory} GB`
        : "unavailable",
      risk: "Medium",
    },
    {
      label: "Plugins Count",
      value: `${plugins} plugins detected`,
      risk: plugins > 0 ? "Medium" : "Low",
    },
    {
      label: "Touch Support",
      value: touchPoints > 0 ? `Yes (${touchPoints} points)` : "No",
      risk: "Low",
    },
  ];
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const classes = {
    Low: "badge-low",
    Medium: "badge-medium",
    High: "badge-high",
  };
  const icons = {
    Low: <CheckCircle className="w-3 h-3" />,
    Medium: <AlertTriangle className="w-3 h-3" />,
    High: <AlertCircle className="w-3 h-3" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium ${classes[risk]}`}
    >
      {icons[risk]}
      {risk}
    </span>
  );
}

function SummaryScore({ items }: { items: FingerprintItem[] }) {
  const highCount = items.filter((i) => i.risk === "High").length;
  const medCount = items.filter((i) => i.risk === "Medium").length;

  let overall: RiskLevel = "Low";
  if (highCount >= 4) overall = "High";
  else if (highCount >= 2 || medCount >= 4) overall = "Medium";

  const pct = Math.round((highCount / items.length) * 100);
  const barColor =
    overall === "High"
      ? "oklch(var(--risk-high))"
      : overall === "Medium"
        ? "oklch(var(--risk-medium))"
        : "oklch(var(--risk-low))";

  return (
    <Card className="terminal-card-glow mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Overall Fingerprint Risk
            </span>
          </div>
          <RiskBadge risk={overall} />
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ background: barColor, boxShadow: `0 0 8px ${barColor}80` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs font-mono text-muted-foreground">
          <span className="text-[oklch(var(--risk-high))]">
            {highCount} High
          </span>
          <span className="text-[oklch(var(--risk-medium))]">
            {medCount} Medium
          </span>
          <span className="text-[oklch(var(--risk-low))]">
            {items.length - highCount - medCount} Low
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function FingerprintAnalyzer() {
  const [items, setItems] = useState<FingerprintItem[]>(() =>
    collectFingerprint(),
  );
  const [scanning, setScanning] = useState(false);

  const rescan = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      setItems(collectFingerprint());
      setScanning(false);
    }, 600);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Browser Fingerprint Analyzer
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            Detect identifying data points exposed by your browser
          </p>
        </div>
        <Button
          onClick={rescan}
          disabled={scanning}
          variant="outline"
          size="sm"
          className="border-primary/30 text-primary hover:bg-primary/10 font-mono"
          data-ocid="fingerprint.rescan_button"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${scanning ? "animate-spin" : ""}`}
          />
          {scanning ? "Scanning..." : "Re-scan"}
        </Button>
      </div>

      <SummaryScore items={items} />

      <div className="grid gap-2">
        {items.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.3 }}
          >
            <div className="terminal-card rounded p-3 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-mono mb-0.5">
                  {item.label}
                </div>
                <div
                  className="text-sm text-foreground font-mono truncate"
                  title={item.value}
                >
                  {item.value}
                </div>
              </div>
              <div className="flex-shrink-0">
                <RiskBadge risk={item.risk} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
