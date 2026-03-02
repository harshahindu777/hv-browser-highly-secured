import { AuditChecklist } from "@/components/AuditChecklist";
import { DnsLeakTest } from "@/components/DnsLeakTest";
import { FingerprintAnalyzer } from "@/components/FingerprintAnalyzer";
import { IdentityChecklist } from "@/components/IdentityChecklist";
import { ProxyGuide } from "@/components/ProxyGuide";
import { SearchEngines } from "@/components/SearchEngines";
import { SecurityWizard } from "@/components/SecurityWizard";
import { Settings } from "@/components/Settings";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import {
  ClipboardCheck,
  Fingerprint,
  LogIn,
  LogOut,
  Menu,
  Network,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  UserX,
  Wifi,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
  | "fingerprint"
  | "dns"
  | "proxy"
  | "search"
  | "wizard"
  | "identity"
  | "audit"
  | "settings";

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: {
  id: Section;
  label: string;
  icon: React.ReactNode;
  ocid: string;
  description: string;
}[] = [
  {
    id: "fingerprint",
    label: "Fingerprint Analyzer",
    icon: <Fingerprint className="w-4 h-4" />,
    ocid: "nav.fingerprint.tab",
    description: "Detect browser data exposure",
  },
  {
    id: "dns",
    label: "DNS Leak Test",
    icon: <Wifi className="w-4 h-4" />,
    ocid: "nav.dns.tab",
    description: "Check for DNS leaks",
  },
  {
    id: "proxy",
    label: "Proxy Guide",
    icon: <Network className="w-4 h-4" />,
    ocid: "nav.proxy.tab",
    description: "SOCKS5 setup instructions",
  },
  {
    id: "search",
    label: "Search Engines",
    icon: <Search className="w-4 h-4" />,
    ocid: "nav.search.tab",
    description: "Privacy-respecting search",
  },
  {
    id: "wizard",
    label: "Security Wizard",
    icon: <ShieldCheck className="w-4 h-4" />,
    ocid: "nav.wizard.tab",
    description: "Configure security level",
  },
  {
    id: "identity",
    label: "New Identity",
    icon: <UserX className="w-4 h-4" />,
    ocid: "nav.identity.tab",
    description: "Session reset procedure",
  },
  {
    id: "audit",
    label: "Audit Checklist",
    icon: <ClipboardCheck className="w-4 h-4" />,
    ocid: "nav.audit.tab",
    description: "Pre-launch security audit",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon className="w-4 h-4" />,
    ocid: "nav.settings.tab",
    description: "App preferences",
  },
];

const SECTION_COMPONENTS: Record<Section, React.ReactNode> = {
  fingerprint: <FingerprintAnalyzer />,
  dns: <DnsLeakTest />,
  proxy: <ProxyGuide />,
  search: <SearchEngines />,
  wizard: <SecurityWizard />,
  identity: <IdentityChecklist />,
  audit: <AuditChecklist />,
  settings: <Settings />,
};

// ─── Sidebar Auth Area ────────────────────────────────────────────────────────

function SidebarAuthArea() {
  const { isAuthenticated, isInitializing, login, logout, principal } =
    useAuth();

  if (isInitializing) {
    return (
      <div className="px-3 py-2 flex items-center gap-2 text-xs font-mono text-muted-foreground/60">
        <span className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
        Initializing...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={login}
        className="w-full h-8 border-primary/30 text-primary/80 hover:text-primary hover:bg-primary/10 hover:border-primary/50 font-mono text-xs transition-all justify-start gap-2"
        data-ocid="auth.sign_in.button"
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </Button>
    );
  }

  // Signed in — show avatar + truncated principal + sign out
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
    : "—";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 px-1 py-1">
        <Avatar className="w-6 h-6 flex-shrink-0">
          <AvatarFallback className="bg-primary/15 text-primary text-xs font-mono">
            {principal?.slice(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-mono text-foreground/80 truncate">
            {shortPrincipal}
          </div>
          <div className="text-xs font-mono text-primary/60 leading-none mt-0.5">
            Signed in
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="w-full h-7 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 font-mono text-xs justify-start gap-2 transition-all"
        data-ocid="auth.sign_out.button"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign Out
      </Button>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  active,
  onSelect,
  onClose,
}: {
  active: Section;
  onSelect: (s: Section) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/generated/privacyshield-logo-transparent.dim_400x400.png"
            alt="PrivacyShield Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <div className="text-sm font-semibold text-foreground leading-none">
              PrivacyShield
            </div>
            <div className="text-xs text-muted-foreground font-mono leading-none mt-0.5">
              v2.0.0
            </div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                onClose?.();
              }}
              className={`w-full text-left px-3 py-2.5 rounded transition-all duration-150 flex items-center gap-3 ${
                isActive ? "nav-item-active" : "nav-item"
              }`}
              data-ocid={item.ocid}
            >
              <span
                className={`flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.icon}
              </span>
              <div className="min-w-0">
                <div
                  className={`text-xs font-medium truncate ${isActive ? "text-primary" : "text-foreground/80"}`}
                >
                  {item.label}
                </div>
                <div className="text-xs text-muted-foreground/70 font-mono truncate">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-1 rounded-full bg-primary ml-auto flex-shrink-0"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Auth footer area */}
      <div className="p-3 border-t border-border space-y-3">
        <SidebarAuthArea />
        <div className="text-xs text-muted-foreground font-mono text-center pt-1">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/60 hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── App (inner) ──────────────────────────────────────────────────────────────

function AppInner() {
  const [activeSection, setActiveSection] = useState<Section>("search");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <Sidebar active={activeSection} onSelect={setActiveSection} />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="lg:hidden fixed inset-y-0 left-0 w-60 bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
            >
              <Sidebar
                active={activeSection}
                onSelect={setActiveSection}
                onClose={() => setMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="text-muted-foreground hover:text-foreground"
            data-ocid="nav.mobile.button"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/privacyshield-logo-transparent.dim_400x400.png"
              alt="PrivacyShield"
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-semibold text-foreground">
              PrivacyShield
            </span>
          </div>
          <div className="ml-auto text-xs font-mono text-muted-foreground truncate">
            {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
          </div>
        </header>

        {/* HV Browser branding bar */}
        <div className="hidden lg:flex items-center px-6 pt-5 pb-0">
          <div
            className="inline-flex items-center border-2 border-primary/60 rounded px-4 py-1.5 bg-primary/5"
            data-ocid="branding.hv_browser.panel"
          >
            <span className="text-base font-extrabold tracking-widest text-primary uppercase font-mono">
              HV Browser
            </span>
          </div>
        </div>

        {/* Section content */}
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-4xl mx-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {SECTION_COMPONENTS[activeSection]}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.14 0.01 195)",
            border: "1px solid oklch(0.24 0.025 195)",
            color: "oklch(0.88 0.04 175)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.8125rem",
          },
        }}
      />
    </div>
  );
}

// ─── App (with providers) ─────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
