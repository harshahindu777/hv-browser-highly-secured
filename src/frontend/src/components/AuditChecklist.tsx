import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAllAuditItems,
  useResetAuditChecklist,
  useSetAuditItem,
} from "@/hooks/useQueries";
import { CheckCircle2, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

const AUDIT_ITEMS = [
  {
    key: "webrtc_disabled",
    label: "WebRTC disabled or proxy-only mode enforced",
    note: "Test at https://browserleaks.com/webrtc",
    url: "https://browserleaks.com/webrtc",
  },
  {
    key: "dns_leak_tested",
    label: "DNS leak test passed",
    note: "Test at https://dnsleaktest.com",
    url: "https://dnsleaktest.com",
  },
  {
    key: "canvas_spoof",
    label: "Canvas fingerprinting neutralized",
    note: "Randomize or block toDataURL()",
    url: null,
  },
  {
    key: "https_only",
    label: "HTTPS-Only mode enforced globally",
    note: "Redirect all HTTP to HTTPS",
    url: null,
  },
  {
    key: "fpi_enabled",
    label: "First-Party Isolation (FPI) enabled",
    note: "Cookies/storage isolated per domain",
    url: null,
  },
  {
    key: "ip_leak_tested",
    label: "IP leak test passed (IPv4 & IPv6)",
    note: "Disable IPv6 if not tunneled",
    url: "https://ipleak.net",
  },
  {
    key: "proxy_kill_switch",
    label: "Kill switch tested — traffic stops on proxy drop",
    note: "Fail-closed behavior verified",
    url: null,
  },
  {
    key: "fonts_restricted",
    label: "Custom fonts restricted or system-only",
    note: "Reduce font fingerprinting surface",
    url: null,
  },
  {
    key: "referrer_policy",
    label: "Referrer policy set to no-referrer or strict-origin",
    note: "Prevent URL leakage across sites",
    url: null,
  },
  {
    key: "security_headers",
    label: "Security headers tested (CSP, HSTS, X-Frame-Options)",
    note: "Use securityheaders.com",
    url: "https://securityheaders.com",
  },
  {
    key: "extensions_audited",
    label: "Extensions/plugins audited for data leaks",
    note: "Minimal extension surface",
    url: null,
  },
  {
    key: "auto_update",
    label: "Auto-update mechanism verified and signed",
    note: "Prevent supply chain attacks",
    url: null,
  },
];

export function AuditChecklist() {
  const { data: items, isLoading } = useGetAllAuditItems();
  const setItemMutation = useSetAuditItem();
  const resetMutation = useResetAuditChecklist();

  const itemMap = new Map(items ?? []);
  const checkedCount = Array.from(itemMap.values()).filter(Boolean).length;
  const total = AUDIT_ITEMS.length;
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  const allDone = checkedCount === total && total > 0;

  async function handleToggle(key: string) {
    const current = itemMap.get(key) ?? false;
    try {
      await setItemMutation.mutateAsync({ key, state: !current });
    } catch {
      toast.error("Failed to update item");
    }
  }

  async function handleReset() {
    try {
      await resetMutation.mutateAsync();
      toast.success("Audit checklist reset");
    } catch {
      toast.error("Failed to reset checklist");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Pre-Launch Security Audit
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          MVP checklist for privacy tool and browser developers
        </p>
      </div>

      {/* Progress bar */}
      <Card className="terminal-card mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">
              Audit Progress
            </span>
            <span className="text-xs font-mono text-primary">
              {checkedCount} / {total} verified
            </span>
          </div>
          <div className="progress-glow">
            <Progress value={progress} className="h-2 bg-muted" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-mono text-muted-foreground">
              {progress}% verified
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={resetMutation.isPending}
              className="text-xs font-mono text-muted-foreground hover:text-destructive h-6 px-2"
              data-ocid="audit.reset_button"
            >
              {resetMutation.isPending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              Reset All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success banner */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="success-banner rounded p-4 mb-4 flex items-center gap-3"
            data-ocid="audit.success_state"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm font-mono">
                Security audit complete
              </div>
              <div className="text-xs opacity-80 font-mono">
                All 12 checks verified — ready for MVP launch
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checklist */}
      {isLoading ? (
        <div className="space-y-2">
          {AUDIT_ITEMS.map((item) => (
            <Skeleton key={item.key} className="h-16 w-full rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {AUDIT_ITEMS.map((item, idx) => {
            const checked = itemMap.get(item.key) ?? false;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card
                  className={`transition-all duration-200 ${checked ? "terminal-card opacity-70" : "terminal-card"}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`audit-${item.key}`}
                        checked={checked}
                        onCheckedChange={() => handleToggle(item.key)}
                        disabled={setItemMutation.isPending}
                        className="mt-0.5 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-ocid={`audit.checkbox.${idx + 1}`}
                      />
                      <label
                        htmlFor={`audit-${item.key}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div
                          className={`text-sm font-medium ${checked ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          <span className="text-primary font-mono mr-2 text-xs">
                            {String(idx + 1).padStart(2, "0")}.
                          </span>
                          {item.label}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="text-xs text-muted-foreground font-mono">
                            {item.note}
                          </div>
                          {item.url && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(item.url!, "_blank");
                              }}
                              className="text-xs text-primary/60 hover:text-primary font-mono flex items-center gap-0.5 underline-offset-2 hover:underline"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              test
                            </button>
                          )}
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
