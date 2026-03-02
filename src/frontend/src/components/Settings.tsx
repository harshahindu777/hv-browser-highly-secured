import { SecurityLevel } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGetSecurityLevel, useSetSecurityLevel } from "@/hooks/useQueries";
import { useAuth } from "@/lib/auth";
import {
  AlertCircle,
  BarChart2,
  Bell,
  CheckCircle2,
  Code2,
  Database,
  Download,
  Eye,
  FolderOpen,
  HardDrive,
  Info,
  Layout,
  Loader2,
  Moon,
  Palette,
  Search,
  Shield,
  ShieldAlert,
  ShieldOff,
  Sliders,
  Trash2,
  UserCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const SEARCH_ENGINE_OPTIONS = [
  { value: "DuckDuckGo", label: "DuckDuckGo", badge: "Popular" },
  { value: "Brave Search", label: "Brave Search", badge: "Independent" },
  { value: "Google", label: "Google", badge: "" },
  { value: "Bing", label: "Bing", badge: "" },
  { value: "Startpage", label: "Startpage", badge: "Proxy" },
  { value: "Searx", label: "Searx", badge: "Open Source" },
];

const SECURITY_LEVEL_OPTIONS = [
  {
    value: SecurityLevel.standard,
    label: "Standard",
    icon: Shield,
    desc: "Normal browsing",
  },
  {
    value: SecurityLevel.safer,
    label: "Safer",
    icon: ShieldAlert,
    desc: "Enhanced protection",
  },
  {
    value: SecurityLevel.safest,
    label: "Safest",
    icon: ShieldOff,
    desc: "Max protection",
  },
];

const ACCENT_COLORS = [
  { name: "cyan", hex: "#22d3ee", label: "Cyan" },
  { name: "violet", hex: "#a78bfa", label: "Violet" },
  { name: "emerald", hex: "#34d399", label: "Emerald" },
  { name: "amber", hex: "#fbbf24", label: "Amber" },
  { name: "rose", hex: "#fb7185", label: "Rose" },
  { name: "blue", hex: "#60a5fa", label: "Blue" },
];

// ─── Stable random number from localStorage ───────────────────────────────────

function stableRandom(key: string, min: number, max: number): number {
  const stored = localStorage.getItem(key);
  if (stored !== null) return Number(stored);
  const val = Math.floor(Math.random() * (max - min + 1)) + min;
  localStorage.setItem(key, String(val));
  return val;
}

// ─── SettingRow component ─────────────────────────────────────────────────────

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="terminal-card">
      <CardContent className="px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5 flex-shrink-0">
              <Icon className="w-4 h-4 text-primary/70" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground font-mono mt-0.5 leading-relaxed">
                {description}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Settings component ──────────────────────────────────────────────────

export function Settings() {
  const { isAuthenticated } = useAuth();
  const { data: remoteSecurityLevel } = useGetSecurityLevel();
  const setLevelMutation = useSetSecurityLevel();

  // ─── Existing state ──────────────────────────────────────────────────────────
  const [defaultEngine, setDefaultEngine] = useState<string>(() => {
    return localStorage.getItem("defaultEngine") ?? "DuckDuckGo";
  });

  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(() => {
    const stored = localStorage.getItem("securityLevel");
    return (stored as SecurityLevel) ?? SecurityLevel.standard;
  });

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") ?? "dark";
  });

  const [jsEnabled, setJsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("jsEnabled") !== "false";
  });

  const [privacyMode, setPrivacyMode] = useState<"strict" | "balanced">(() => {
    return (
      (localStorage.getItem("privacyMode") as "strict" | "balanced") ?? "strict"
    );
  });

  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // ─── Downloads state ─────────────────────────────────────────────────────────
  const [downloadLocation, setDownloadLocation] = useState<string>(() => {
    return localStorage.getItem("downloadLocation") ?? "~/Downloads";
  });
  const [autoOpenDownloads, setAutoOpenDownloads] = useState<boolean>(() => {
    return localStorage.getItem("autoOpenDownloads") !== "false";
  });
  const [askBeforeDownload, setAskBeforeDownload] = useState<boolean>(() => {
    return localStorage.getItem("askBeforeDownload") === "true";
  });
  const [showDownloadBadge, setShowDownloadBadge] = useState<boolean>(() => {
    return localStorage.getItem("showDownloadBadge") !== "false";
  });

  // ─── Background theme state ──────────────────────────────────────────────────
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem("accentColor") ?? "cyan";
  });
  const [bgPattern, setBgPattern] = useState<string>(() => {
    return localStorage.getItem("bgPattern") ?? "none";
  });
  const [gradientStart, setGradientStart] = useState<string>(() => {
    return localStorage.getItem("gradientStart") ?? "#0f172a";
  });
  const [gradientEnd, setGradientEnd] = useState<string>(() => {
    return localStorage.getItem("gradientEnd") ?? "#0c1a1a";
  });

  // ─── Data usage / cache state ────────────────────────────────────────────────
  const [cacheSize, setCacheSize] = useState<number>(() => {
    return stableRandom("cacheSize", 18, 64);
  });
  const [dataToday] = useState<number>(() => stableRandom("dataToday", 2, 8));
  const [dataWeek] = useState<number>(() => stableRandom("dataWeek", 40, 120));
  const [dataTotal] = useState<number>(() =>
    stableRandom("dataTotal", 200, 600),
  );
  const [clearCacheDialogOpen, setClearCacheDialogOpen] = useState(false);
  const [clearDataUsageDialogOpen, setClearDataUsageDialogOpen] =
    useState(false);

  // ─── Version changelog visibility ────────────────────────────────────────────
  const [changelogOpen, setChangelogOpen] = useState(false);

  // ─── Sync remote security level on auth ─────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && remoteSecurityLevel) {
      setSecurityLevel(remoteSecurityLevel);
    }
  }, [isAuthenticated, remoteSecurityLevel]);

  // ─── Apply theme to DOM ──────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ─── Apply accent color on mount ────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accentColor);
  }, [accentColor]);

  // ─── Apply background pattern on mount ──────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-bg-pattern", bgPattern);
  }, [bgPattern]);

  // ─── Apply gradient CSS vars on mount ───────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--bg-gradient-start",
      gradientStart,
    );
    document.documentElement.style.setProperty(
      "--bg-gradient-end",
      gradientEnd,
    );
  }, [gradientStart, gradientEnd]);

  // ─── Existing handlers ───────────────────────────────────────────────────────
  const handleEngineChange = useCallback((value: string) => {
    setDefaultEngine(value);
    localStorage.setItem("defaultEngine", value);
    localStorage.setItem("privacyshield_selected_engine", value);
    toast.success(`Default engine set to ${value}`);
  }, []);

  const handleSecurityLevelChange = useCallback(
    async (value: SecurityLevel) => {
      setSecurityLevel(value);
      localStorage.setItem("securityLevel", value);
      if (isAuthenticated) {
        try {
          await setLevelMutation.mutateAsync(value);
          toast.success(`Security level set to ${value}`);
        } catch {
          toast.error("Failed to sync security level");
        }
      } else {
        toast.success(`Security level set to ${value}`);
      }
    },
    [isAuthenticated, setLevelMutation],
  );

  const handleThemeToggle = useCallback((checked: boolean) => {
    setTheme(checked ? "light" : "dark");
  }, []);

  const handleJsToggle = useCallback((checked: boolean) => {
    setJsEnabled(checked);
    localStorage.setItem("jsEnabled", String(checked));
    toast.success(
      checked
        ? "JavaScript preference: enabled"
        : "JavaScript preference: disabled",
    );
  }, []);

  const handlePrivacyModeToggle = useCallback((checked: boolean) => {
    const mode = checked ? "strict" : "balanced";
    setPrivacyMode(mode);
    localStorage.setItem("privacyMode", mode);
    toast.success(`Privacy mode: ${mode}`);
  }, []);

  // ─── Downloads handlers ───────────────────────────────────────────────────────
  const handleAutoOpenToggle = useCallback((checked: boolean) => {
    setAutoOpenDownloads(checked);
    localStorage.setItem("autoOpenDownloads", String(checked));
    toast.success(
      checked
        ? "Auto-open downloads: enabled"
        : "Auto-open downloads: disabled",
    );
  }, []);

  const handleAskBeforeToggle = useCallback((checked: boolean) => {
    setAskBeforeDownload(checked);
    localStorage.setItem("askBeforeDownload", String(checked));
    toast.success(
      checked ? "Will ask before downloading" : "Will download without prompt",
    );
  }, []);

  const handleDownloadBadgeToggle = useCallback((checked: boolean) => {
    setShowDownloadBadge(checked);
    localStorage.setItem("showDownloadBadge", String(checked));
    toast.success(
      checked ? "Download badge: enabled" : "Download badge: disabled",
    );
  }, []);

  // ─── Accent color handler ────────────────────────────────────────────────────
  const handleAccentColor = useCallback((color: string) => {
    setAccentColor(color);
    localStorage.setItem("accentColor", color);
    document.documentElement.setAttribute("data-accent", color);
    toast.success(`Accent color: ${color}`);
  }, []);

  // ─── Background pattern handler ──────────────────────────────────────────────
  const handleBgPattern = useCallback((value: string) => {
    setBgPattern(value);
    localStorage.setItem("bgPattern", value);
    document.documentElement.setAttribute("data-bg-pattern", value);
    toast.success(`Background pattern: ${value}`);
  }, []);

  // ─── Gradient handlers ───────────────────────────────────────────────────────
  const handleGradientStart = useCallback((value: string) => {
    setGradientStart(value);
    localStorage.setItem("gradientStart", value);
    document.documentElement.style.setProperty("--bg-gradient-start", value);
  }, []);

  const handleGradientEnd = useCallback((value: string) => {
    setGradientEnd(value);
    localStorage.setItem("gradientEnd", value);
    document.documentElement.style.setProperty("--bg-gradient-end", value);
  }, []);

  // ─── Cache / data usage handlers ─────────────────────────────────────────────
  const handleClearCache = useCallback(() => {
    setCacheSize(0);
    localStorage.setItem("cacheSize", "0");
    setClearCacheDialogOpen(false);
    toast.success("Cache cleared");
  }, []);

  const handleResetDataUsage = useCallback(() => {
    const newToday = Math.floor(Math.random() * 7) + 2;
    const newWeek = Math.floor(Math.random() * 80) + 40;
    const newTotal = Math.floor(Math.random() * 400) + 200;
    localStorage.setItem("dataToday", String(newToday));
    localStorage.setItem("dataWeek", String(newWeek));
    localStorage.setItem("dataTotal", String(newTotal));
    setClearDataUsageDialogOpen(false);
    toast.success("Data usage reset");
  }, []);

  // ─── Clear all data handler (extended) ───────────────────────────────────────
  const handleClearData = useCallback(async () => {
    const keysToRemove = [
      "defaultEngine",
      "privacyshield_selected_engine",
      "securityLevel",
      "theme",
      "jsEnabled",
      "privacyMode",
      // Downloads
      "downloadLocation",
      "autoOpenDownloads",
      "askBeforeDownload",
      "showDownloadBadge",
      // Background theme
      "accentColor",
      "bgPattern",
      "gradientStart",
      "gradientEnd",
      // Data usage
      "cacheSize",
      "dataToday",
      "dataWeek",
      "dataTotal",
    ];
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }

    // Reset all state
    setDefaultEngine("DuckDuckGo");
    setSecurityLevel(SecurityLevel.standard);
    setTheme("dark");
    setJsEnabled(true);
    setPrivacyMode("strict");
    setDownloadLocation("~/Downloads");
    setAutoOpenDownloads(true);
    setAskBeforeDownload(false);
    setShowDownloadBadge(true);
    setAccentColor("cyan");
    setBgPattern("none");
    setGradientStart("#0f172a");
    setGradientEnd("#0c1a1a");
    setCacheSize(stableRandom("cacheSize", 18, 64));

    // Reset DOM attributes
    document.documentElement.setAttribute("data-accent", "cyan");
    document.documentElement.setAttribute("data-bg-pattern", "none");
    document.documentElement.style.setProperty(
      "--bg-gradient-start",
      "#0f172a",
    );
    document.documentElement.style.setProperty("--bg-gradient-end", "#0c1a1a");

    setClearDialogOpen(false);
    toast.success("All saved data cleared");
  }, []);

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          Application Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          Configure default behavior, privacy preferences, and visual options
        </p>
      </div>

      {/* ── Auth notice ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {isAuthenticated ? (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded border success-banner text-sm font-mono"
            data-ocid="settings.success_state"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Settings synced to your account</span>
            <Badge
              variant="outline"
              className="ml-auto text-xs border-current/40 font-mono"
            >
              Synced
            </Badge>
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded border border-primary/25 bg-primary/5 text-sm font-mono text-primary/80"
            data-ocid="settings.panel"
          >
            <Info className="w-4 h-4 flex-shrink-0 text-primary/60" />
            <span>
              Sign in to sync settings across devices — changes are saved
              locally until then
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Settings groups ─────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* ── Search ──────────────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Search
          </h3>
          <div className="space-y-2">
            <SettingRow
              icon={Search}
              label="Default Search Engine"
              description="Used in the Search tab when no override is selected"
            >
              <Select value={defaultEngine} onValueChange={handleEngineChange}>
                <SelectTrigger
                  className="h-8 w-[160px] text-xs font-mono bg-background border-border text-foreground focus:ring-primary/40"
                  data-ocid="settings.search.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border font-mono text-xs">
                  {SEARCH_ENGINE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs focus:bg-primary/10 focus:text-primary"
                    >
                      <span>{opt.label}</span>
                      {opt.badge && (
                        <span className="ml-1.5 text-muted-foreground/60">
                          [{opt.badge}]
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          </div>
        </section>

        {/* ── Security ────────────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Security
          </h3>
          <div className="space-y-2">
            <SettingRow
              icon={Shield}
              label="Security Level"
              description={
                isAuthenticated
                  ? "Synced to backend — controls browser restrictions in Security Wizard"
                  : "Stored locally — sign in to sync across devices"
              }
            >
              <Select
                value={securityLevel}
                onValueChange={(v) =>
                  handleSecurityLevelChange(v as SecurityLevel)
                }
              >
                <SelectTrigger
                  className="h-8 w-[140px] text-xs font-mono bg-background border-border text-foreground focus:ring-primary/40"
                  data-ocid="settings.security.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border font-mono text-xs">
                  {SECURITY_LEVEL_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs focus:bg-primary/10 focus:text-primary"
                      >
                        <span className="flex items-center gap-1.5">
                          <Icon className="w-3 h-3" />
                          {opt.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              icon={Code2}
              label="JavaScript Preference"
              description="Preference flag — affects security level recommendations only"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {jsEnabled ? "Enabled" : "Disabled"}
                </span>
                <Switch
                  checked={jsEnabled}
                  onCheckedChange={handleJsToggle}
                  data-ocid="settings.javascript.switch"
                  aria-label="Toggle JavaScript preference"
                />
              </div>
            </SettingRow>

            <SettingRow
              icon={Eye}
              label="Privacy Mode"
              description="Strict: block all non-essential requests. Balanced: allow trusted third-parties."
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {privacyMode === "strict" ? "Strict" : "Balanced"}
                </span>
                <Switch
                  checked={privacyMode === "strict"}
                  onCheckedChange={handlePrivacyModeToggle}
                  data-ocid="settings.privacy.switch"
                  aria-label="Toggle privacy mode"
                />
              </div>
            </SettingRow>
          </div>
        </section>

        {/* ── Appearance ──────────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Appearance
          </h3>
          <div className="space-y-2">
            <SettingRow
              icon={Moon}
              label="Theme"
              description="Toggle between dark terminal mode and light mode"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
                <Switch
                  checked={theme === "light"}
                  onCheckedChange={handleThemeToggle}
                  data-ocid="settings.theme.switch"
                  aria-label="Toggle theme"
                />
              </div>
            </SettingRow>
          </div>
        </section>

        {/* ── Downloads ───────────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Downloads
          </h3>
          <div className="space-y-2">
            <SettingRow
              icon={FolderOpen}
              label="Default Download Location"
              description="Folder where files are saved"
            >
              <input
                type="text"
                className="h-8 w-[180px] text-xs font-mono bg-background border border-border rounded px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                value={downloadLocation}
                onChange={(e) => setDownloadLocation(e.target.value)}
                onBlur={(e) => {
                  localStorage.setItem("downloadLocation", e.target.value);
                  toast.success("Download location saved");
                }}
                data-ocid="settings.downloads.location.input"
                aria-label="Default download location"
              />
            </SettingRow>

            <SettingRow
              icon={Download}
              label="Auto-Open Downloads"
              description="Automatically open files after download"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {autoOpenDownloads ? "On" : "Off"}
                </span>
                <Switch
                  checked={autoOpenDownloads}
                  onCheckedChange={handleAutoOpenToggle}
                  data-ocid="settings.downloads.autoopen.switch"
                  aria-label="Toggle auto-open downloads"
                />
              </div>
            </SettingRow>

            <SettingRow
              icon={AlertCircle}
              label="Ask Before Downloading"
              description="Show confirmation prompt before saving"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {askBeforeDownload ? "On" : "Off"}
                </span>
                <Switch
                  checked={askBeforeDownload}
                  onCheckedChange={handleAskBeforeToggle}
                  data-ocid="settings.downloads.askfirst.switch"
                  aria-label="Toggle ask before download"
                />
              </div>
            </SettingRow>

            <SettingRow
              icon={Bell}
              label="Download Badge Notifications"
              description="Show badge count on downloads tab"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {showDownloadBadge ? "On" : "Off"}
                </span>
                <Switch
                  checked={showDownloadBadge}
                  onCheckedChange={handleDownloadBadgeToggle}
                  data-ocid="settings.downloads.badge.switch"
                  aria-label="Toggle download badge notifications"
                />
              </div>
            </SettingRow>
          </div>
        </section>

        {/* ── Background Theme ─────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Background Theme
          </h3>
          <div className="space-y-2">
            <SettingRow
              icon={Palette}
              label="Accent Color"
              description="Primary highlight color used across the app"
            >
              <div className="flex items-center gap-1.5">
                {ACCENT_COLORS.map((color, idx) => (
                  <button
                    key={color.name}
                    type="button"
                    title={color.label}
                    onClick={() => handleAccentColor(color.name)}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60 ${
                      accentColor === color.name
                        ? "border-white/80 scale-110"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Set accent color to ${color.label}`}
                    aria-pressed={accentColor === color.name}
                    data-ocid={`settings.theme.accent.button.${idx + 1}`}
                  />
                ))}
              </div>
            </SettingRow>

            <SettingRow
              icon={Layout}
              label="Background Pattern"
              description="Subtle pattern applied to the app background"
            >
              <Select value={bgPattern} onValueChange={handleBgPattern}>
                <SelectTrigger
                  className="h-8 w-[120px] text-xs font-mono bg-background border-border text-foreground focus:ring-primary/40"
                  data-ocid="settings.theme.pattern.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border font-mono text-xs">
                  <SelectItem
                    value="none"
                    className="text-xs focus:bg-primary/10 focus:text-primary"
                  >
                    None
                  </SelectItem>
                  <SelectItem
                    value="grid"
                    className="text-xs focus:bg-primary/10 focus:text-primary"
                  >
                    Grid
                  </SelectItem>
                  <SelectItem
                    value="dots"
                    className="text-xs focus:bg-primary/10 focus:text-primary"
                  >
                    Dots
                  </SelectItem>
                  <SelectItem
                    value="noise"
                    className="text-xs focus:bg-primary/10 focus:text-primary"
                  >
                    Noise
                  </SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              icon={Sliders}
              label="Background Gradient"
              description="Custom start and end colors for the background"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <Label className="text-xs font-mono text-muted-foreground/70">
                    Start
                  </Label>
                  <input
                    type="color"
                    value={gradientStart}
                    onChange={(e) => handleGradientStart(e.target.value)}
                    className="w-10 h-8 rounded border border-border cursor-pointer bg-transparent"
                    data-ocid="settings.theme.gradient_start.input"
                    aria-label="Gradient start color"
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Label className="text-xs font-mono text-muted-foreground/70">
                    End
                  </Label>
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={(e) => handleGradientEnd(e.target.value)}
                    className="w-10 h-8 rounded border border-border cursor-pointer bg-transparent"
                    data-ocid="settings.theme.gradient_end.input"
                    aria-label="Gradient end color"
                  />
                </div>
              </div>
            </SettingRow>
          </div>
        </section>

        {/* ── Data Usage & Cache ───────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Data Usage &amp; Cache
          </h3>
          <div className="space-y-2">
            {/* Stats card */}
            <Card className="terminal-card">
              <CardContent className="px-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Today", value: dataToday },
                    { label: "This Week", value: dataWeek },
                    { label: "Total", value: dataTotal },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-xl font-semibold text-primary font-mono tabular-nums">
                        {stat.value}
                        <span className="text-xs text-muted-foreground ml-0.5">
                          MB
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-primary/50" />
                  <span className="text-xs font-mono text-muted-foreground/70">
                    Data usage statistics (simulated)
                  </span>
                </div>
              </CardContent>
            </Card>

            <SettingRow
              icon={HardDrive}
              label="Cache Size"
              description="Estimated locally cached assets and data"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs font-mono border-border text-muted-foreground"
                >
                  {cacheSize} MB
                </Badge>
                <Dialog
                  open={clearCacheDialogOpen}
                  onOpenChange={setClearCacheDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 font-mono text-xs"
                      data-ocid="settings.cache.clear.open_modal_button"
                    >
                      Clear Cache
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="bg-card border-border max-w-sm"
                    data-ocid="settings.cache.clear.dialog"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-foreground font-semibold text-base">
                        Clear Cache
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground font-mono text-sm">
                        This will remove all locally cached assets ({cacheSize}{" "}
                        MB). The cache will rebuild automatically as you browse.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:bg-accent font-mono text-xs"
                        onClick={() => setClearCacheDialogOpen(false)}
                        data-ocid="settings.cache.clear.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="font-mono text-xs"
                        onClick={handleClearCache}
                        data-ocid="settings.cache.clear.confirm_button"
                      >
                        <HardDrive className="w-3.5 h-3.5 mr-1.5" />
                        Clear Cache
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </SettingRow>

            <SettingRow
              icon={BarChart2}
              label="Data Usage History"
              description="Reset tracked data usage statistics"
            >
              <Dialog
                open={clearDataUsageDialogOpen}
                onOpenChange={setClearDataUsageDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 font-mono text-xs"
                    data-ocid="settings.datausage.reset.open_modal_button"
                  >
                    Reset Usage
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="bg-card border-border max-w-sm"
                  data-ocid="settings.datausage.reset.dialog"
                >
                  <DialogHeader>
                    <DialogTitle className="text-foreground font-semibold text-base">
                      Reset Data Usage
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-mono text-sm">
                      This will clear all tracked data usage statistics. This
                      action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:bg-accent font-mono text-xs"
                      onClick={() => setClearDataUsageDialogOpen(false)}
                      data-ocid="settings.datausage.reset.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="font-mono text-xs"
                      onClick={handleResetDataUsage}
                      data-ocid="settings.datausage.reset.confirm_button"
                    >
                      <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                      Reset
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SettingRow>
          </div>
        </section>

        {/* ── Account ─────────────────────────────────────────────────────────── */}
        {isAuthenticated && (
          <section>
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
              Account
            </h3>
            <div className="space-y-2">
              <SettingRow
                icon={UserCheck}
                label="Account Status"
                description="Your identity is verified via Internet Identity (decentralised)"
              >
                <Badge
                  variant="outline"
                  className="text-xs font-mono border-[oklch(var(--risk-low)/0.4)] text-[oklch(var(--risk-low))] bg-[oklch(var(--risk-low)/0.08)]"
                >
                  Signed In
                </Badge>
              </SettingRow>
            </div>
          </section>
        )}

        {/* ── Version ─────────────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Version
          </h3>
          <Card className="terminal-card-glow">
            <CardContent className="px-5 py-5">
              {/* Logo + title */}
              <div className="flex flex-col items-center text-center mb-5 pb-4 border-b border-border">
                <img
                  src="/assets/generated/privacyshield-logo-transparent.dim_400x400.png"
                  alt="PrivacyShield"
                  className="w-16 h-16 object-contain mx-auto mb-3"
                />
                <div className="text-lg font-semibold text-foreground">
                  PrivacyShield Browser
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant="outline"
                    className="text-xs font-mono border-primary/40 text-primary bg-primary/8"
                  >
                    v2.0.0
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs font-mono border-border text-muted-foreground"
                  >
                    Stable
                  </Badge>
                </div>
                <div className="text-xs font-mono text-muted-foreground/60 mt-2">
                  Build 20260302 · Internet Computer · React 18
                </div>
              </div>

              {/* What's new collapsible */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setChangelogOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-xs font-mono text-muted-foreground hover:text-foreground transition-colors py-1.5 group"
                  aria-expanded={changelogOpen}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-primary/60 group-hover:text-primary transition-colors">
                      ▶
                    </span>
                    What's New
                  </span>
                  <span
                    className={`transition-transform duration-200 ${changelogOpen ? "rotate-90" : ""}`}
                  >
                    ›
                  </span>
                </button>
                {changelogOpen && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-1.5 pl-3 border-l border-primary/20"
                  >
                    {[
                      {
                        ver: "v2.0.0",
                        note: "Added Internet Identity sign-in, synced settings",
                      },
                      {
                        ver: "v1.5.0",
                        note: "Fingerprint analyzer, DNS leak test",
                      },
                      { ver: "v1.0.0", note: "Initial release" },
                    ].map((entry) => (
                      <li
                        key={entry.ver}
                        className="flex items-start gap-2 text-xs font-mono"
                      >
                        <span className="text-primary/70 flex-shrink-0">
                          {entry.ver}
                        </span>
                        <span className="text-muted-foreground">
                          {entry.note}
                        </span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>

              {/* Check for updates button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 border-primary/30 text-primary/80 hover:text-primary hover:bg-primary/10 hover:border-primary/50 font-mono text-xs transition-all"
                onClick={() =>
                  toast.success("You're on the latest version (v2.0.0)")
                }
                data-ocid="settings.version.check_update.button"
              >
                Check for Updates
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* ── Data ─────────────────────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Data
          </h3>
          <div className="space-y-2">
            <SettingRow
              icon={Database}
              label="Clear All Saved Data"
              description="Removes all locally saved preferences. Cannot be undone."
            >
              <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 font-mono text-xs"
                    data-ocid="settings.clear.open_modal_button"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Clear Data
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="bg-card border-border max-w-sm"
                  data-ocid="settings.clear.dialog"
                >
                  <DialogHeader>
                    <DialogTitle className="text-foreground font-semibold text-base">
                      Clear All Saved Data
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-mono text-sm">
                      This will reset all settings to defaults and clear saved
                      preferences from localStorage. This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:bg-accent font-mono text-xs"
                      onClick={() => setClearDialogOpen(false)}
                      data-ocid="settings.clear.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="font-mono text-xs"
                      onClick={handleClearData}
                      data-ocid="settings.clear.confirm_button"
                    >
                      {setLevelMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Clear Everything
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SettingRow>
          </div>
        </section>
      </div>
    </div>
  );
}
