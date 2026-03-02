import { SecurityLevel } from "@/backend.d";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSecurityLevel, useSetSecurityLevel } from "@/hooks/useQueries";
import {
  CheckCircle,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldOff,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

type LevelConfig = {
  id: SecurityLevel;
  label: string;
  icon: React.ReactNode;
  tagline: string;
  ocid: string;
  enabled: string[];
  disabled: string[];
  recommendations: string[];
};

const LEVELS: LevelConfig[] = [
  {
    id: SecurityLevel.standard,
    label: "Standard",
    ocid: "wizard.standard.card",
    icon: <Shield className="w-6 h-6" />,
    tagline: "Normal browsing with no restrictions",
    enabled: [
      "JavaScript enabled everywhere",
      "Media autoplay allowed",
      "All fonts loaded",
      "WebRTC allowed",
      "HTTP connections permitted",
    ],
    disabled: [],
    recommendations: [
      "Enable HTTPS-Only mode in browser settings",
      "Install uBlock Origin for basic ad/tracker blocking",
      "Use a privacy-respecting search engine (DuckDuckGo, Brave)",
      "Periodically clear cookies and site data",
      "Review installed extensions for excessive permissions",
    ],
  },
  {
    id: SecurityLevel.safer,
    label: "Safer",
    ocid: "wizard.safer.card",
    icon: <ShieldAlert className="w-6 h-6" />,
    tagline: "Enhanced protection for most use cases",
    enabled: [
      "JavaScript on trusted HTTPS sites",
      "WebRTC restricted (non-default routes blocked)",
      "Basic fonts only",
    ],
    disabled: [
      "JavaScript disabled on non-HTTPS sites",
      "Media autoplay disabled",
      "Complex font rendering limited",
    ],
    recommendations: [
      "Set network.proxy.socks_remote_dns = true in Firefox",
      "Set media.peerconnection.enabled = false to disable WebRTC",
      "Configure NoScript or uMatrix for JS control",
      "Enable DNS over HTTPS in browser settings",
      "Disable third-party cookies globally",
    ],
  },
  {
    id: SecurityLevel.safest,
    label: "Safest",
    ocid: "wizard.safest.card",
    icon: <ShieldOff className="w-6 h-6" />,
    tagline: "Maximum protection — reduced functionality",
    enabled: [
      "HTTPS-Only mode enforced",
      "System fonts only",
      "First-Party Isolation active",
    ],
    disabled: [
      "JavaScript disabled everywhere",
      "All media playback blocked",
      "WebRTC completely disabled",
      "Custom fonts blocked",
      "All HTTP connections blocked",
    ],
    recommendations: [
      "Set javascript.enabled = false in about:config",
      "Set media.peerconnection.enabled = false",
      "Set privacy.firstparty.isolate = true",
      "Set browser.fonts.allowUserFonts = false",
      "Route all traffic through Tor or trusted SOCKS5 proxy",
      "Set network.http.sendRefererHeader = 0",
      "Disable WebGL: webgl.disabled = true",
    ],
  },
];

export function SecurityWizard() {
  const { data: currentLevel, isLoading } = useGetSecurityLevel();
  const setLevelMutation = useSetSecurityLevel();

  async function selectLevel(level: SecurityLevel) {
    try {
      await setLevelMutation.mutateAsync(level);
      toast.success(`Security level set to ${level}`);
    } catch {
      toast.error("Failed to update security level");
    }
  }

  const activeConfig = LEVELS.find((l) => l.id === currentLevel) ?? LEVELS[0];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Security Level Wizard
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          Select your threat model — each level progressively restricts browser
          capabilities
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {LEVELS.map((level) => {
            const isActive = currentLevel === level.id;
            return (
              <motion.div
                key={level.id}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 h-full ${
                    isActive
                      ? "terminal-card-glow border-primary/50"
                      : "terminal-card hover:border-primary/25"
                  }`}
                  onClick={() => selectLevel(level.id)}
                  data-ocid={level.ocid}
                >
                  <CardContent className="p-4">
                    <div
                      className={`mb-3 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {level.icon}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-semibold text-sm ${isActive ? "text-primary text-glow-sm" : "text-foreground"}`}
                      >
                        {level.label}
                      </h3>
                      {isActive && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono badge-low">
                          Active
                        </span>
                      )}
                      {setLevelMutation.isPending &&
                        currentLevel !== level.id && (
                          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mb-3">
                      {level.tagline}
                    </p>

                    <div className="space-y-1">
                      {level.enabled.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-1.5 text-xs text-foreground/80 font-mono"
                        >
                          <CheckCircle className="w-3 h-3 text-[oklch(var(--risk-low))] flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                      {level.disabled.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono"
                        >
                          <XCircle className="w-3 h-3 text-[oklch(var(--risk-high))] flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recommendations panel */}
      {activeConfig && (
        <motion.div
          key={activeConfig.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="terminal-card">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <span className="text-primary">{activeConfig.icon}</span>
                {activeConfig.label} Mode — Recommended Configuration
              </h3>
              <p className="text-xs text-muted-foreground font-mono mb-4">
                Apply these settings in your browser to activate{" "}
                {activeConfig.label} mode:
              </p>
              <div className="space-y-2">
                {activeConfig.recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary font-mono text-xs mt-0.5 flex-shrink-0">
                      →
                    </span>
                    <span className="text-xs text-foreground font-mono">
                      {rec}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
