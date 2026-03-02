import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAllIdentityItems,
  useResetIdentityChecklist,
  useSetIdentityItem,
} from "@/hooks/useQueries";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, Info, Loader2, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const IDENTITY_ITEMS = [
  {
    key: "clear_cookies",
    label: "Clear all cookies and site data",
    note: "Settings → Privacy → Clear browsing data → All time",
  },
  {
    key: "clear_cache",
    label: "Clear browser cache",
    note: "Includes cached images, scripts, and page data",
  },
  {
    key: "close_tabs",
    label: "Close all open tabs",
    note: "Open tabs may contain session tokens and active connections",
  },
  {
    key: "disconnect_proxy",
    label: "Disconnect current proxy/Tor circuit",
    note: "Terminate the existing anonymization path",
  },
  {
    key: "new_proxy",
    label: "Request new proxy IP / new Tor circuit",
    note: "In Tor Browser: press 'New Circuit' or restart Tor service",
  },
  {
    key: "restart_browser",
    label: "Restart browser session",
    note: "Full restart clears all in-memory data and session state",
  },
  {
    key: "verify_ip",
    label: "Verify new IP address",
    note: "Visit https://api.ipify.org or the DNS Leak Test section above",
  },
  {
    key: "dns_check",
    label: "Run DNS leak check",
    note: "Confirm DNS is resolving through your proxy — not your ISP",
  },
];

const LOCAL_STORAGE_KEY = "identity_checklist";

function loadLocalItems(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Record<string, boolean>;
  } catch {
    // ignore parse errors
  }
  return {};
}

function saveLocalItems(items: Record<string, boolean>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export function IdentityChecklist() {
  const { isAuthenticated } = useAuth();

  // ─── Backend (authenticated) ─────────────────────────────────────────────────
  const { data: items, isLoading: backendLoading } = useGetAllIdentityItems();
  const setItemMutation = useSetIdentityItem();
  const resetMutation = useResetIdentityChecklist();

  // ─── Local (unauthenticated) ─────────────────────────────────────────────────
  const [localItems, setLocalItems] = useState<Record<string, boolean>>(() =>
    loadLocalItems(),
  );

  // ─── Derived state ───────────────────────────────────────────────────────────
  const itemMap: Map<string, boolean> = isAuthenticated
    ? new Map(items ?? [])
    : new Map(Object.entries(localItems));

  const isLoading = isAuthenticated ? backendLoading : false;

  const checkedCount = Array.from(itemMap.values()).filter(Boolean).length;
  const total = IDENTITY_ITEMS.length;
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  const allDone = checkedCount === total && total > 0;

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleToggle = useCallback(
    async (key: string) => {
      if (isAuthenticated) {
        const current = itemMap.get(key) ?? false;
        try {
          await setItemMutation.mutateAsync({ key, state: !current });
        } catch {
          toast.error("Failed to update item");
        }
      } else {
        setLocalItems((prev) => {
          const next = { ...prev, [key]: !prev[key] };
          saveLocalItems(next);
          return next;
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, itemMap, setItemMutation],
  );

  const handleReset = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await resetMutation.mutateAsync();
        toast.success("Identity checklist reset");
      } catch {
        toast.error("Failed to reset checklist");
      }
    } else {
      setLocalItems({});
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // ignore
      }
      toast.success("Identity checklist reset");
    }
  }, [isAuthenticated, resetMutation]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          New Identity Procedure
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          Follow these steps to reset your session and obtain a new identity
        </p>
      </div>

      {/* ── Auth notice (unauthenticated only) ─────────────────────────────── */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded border border-primary/25 bg-primary/5 text-xs font-mono text-primary/80"
            data-ocid="identity.panel"
          >
            <Info className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
            <span>
              Sign in to sync your identity checklist across devices — checked
              items are saved locally until then
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Progress bar ──────────────────────────────────────────────────────── */}
      <Card className="terminal-card mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">
              Progress
            </span>
            <span className="text-xs font-mono text-primary">
              {checkedCount} / {total} complete
            </span>
          </div>
          <div className="progress-glow">
            <Progress value={progress} className="h-2 bg-muted" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-mono text-muted-foreground">
              {progress}% complete
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={resetMutation.isPending}
              className="text-xs font-mono text-muted-foreground hover:text-destructive h-6 px-2"
              data-ocid="identity.reset_button"
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

      {/* ── Success banner ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="success-banner rounded p-4 mb-4 flex items-center gap-3"
            data-ocid="identity.success_state"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm font-mono">
                Identity reset complete
              </div>
              <div className="text-xs opacity-80 font-mono">
                All procedures confirmed — you now have a fresh session
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Checklist ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2">
          {IDENTITY_ITEMS.map((item) => (
            <Skeleton key={item.key} className="h-16 w-full rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {IDENTITY_ITEMS.map((item, idx) => {
            const checked = itemMap.get(item.key) ?? false;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card
                  className={`transition-all duration-200 ${checked ? "terminal-card opacity-70" : "terminal-card"}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`identity-${item.key}`}
                        checked={checked}
                        onCheckedChange={() => handleToggle(item.key)}
                        disabled={isAuthenticated && setItemMutation.isPending}
                        className="mt-0.5 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-ocid={`identity.checkbox.${idx + 1}`}
                      />
                      <label
                        htmlFor={`identity-${item.key}`}
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
                        {item.note && (
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            {item.note}
                          </div>
                        )}
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
