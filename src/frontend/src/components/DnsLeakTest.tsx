import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Globe,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const DNS_PREVENTION_STEPS = [
  {
    id: "doh",
    label: "Use DNS over HTTPS (DoH)",
    detail: "Encrypts DNS queries — prevents ISP from logging your lookups",
  },
  {
    id: "vpn_dns",
    label: "Route DNS through VPN/Tor",
    detail: "All DNS requests travel through the anonymizing tunnel",
  },
  {
    id: "ipv6",
    label: "Disable IPv6 if not tunneled",
    detail: "IPv6 traffic may bypass VPN and reveal your real address",
  },
  {
    id: "resolver",
    label: "Use a trusted resolver (Quad9 / Cloudflare 1.1.1.1)",
    detail: "These resolvers do not log or sell your query data",
  },
];

export function DnsLeakTest() {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchIp();
  }, []);

  async function fetchIp() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      setIp(data.ip);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">DNS Leak Test</h2>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          Detect if your DNS requests are leaking outside your anonymity layer
        </p>
      </div>

      {/* Explainer */}
      <Card className="terminal-card mb-4">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-[oklch(var(--risk-medium))] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                What is a DNS leak?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A DNS leak occurs when your DNS queries are sent outside your
                VPN or Tor tunnel, revealing the websites you visit to your ISP
                or network observer — even if your IP address is hidden. This
                completely undermines anonymity. Your DNS resolver should always
                be the same network your traffic routes through.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP Detection */}
      <Card className="terminal-card-glow mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Your Detected Public IP
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Resolving...
            </div>
          ) : error ? (
            <div className="text-[oklch(var(--risk-high))] font-mono text-sm">
              ⚠ Failed to fetch IP — check your network
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-2xl text-glow text-primary tracking-widest"
            >
              {ip}
            </motion.div>
          )}
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Via api.ipify.org — this is the IP visible to external servers
          </p>
        </CardContent>
      </Card>

      {/* External Test Links */}
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Card className="terminal-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              DNS Leak Test
            </h3>
            <p className="text-xs text-muted-foreground mb-3 font-mono">
              Comprehensive DNS resolver detection — checks all configured
              resolvers
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-primary/30 text-primary hover:bg-primary/10 font-mono"
              onClick={() => window.open("https://dnsleaktest.com", "_blank")}
              data-ocid="dns.visit_dnsleaktest.button"
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              Open dnsleaktest.com
            </Button>
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              IP Leak Test
            </h3>
            <p className="text-xs text-muted-foreground mb-3 font-mono">
              Tests IPv4, IPv6, WebRTC, and DNS leaks simultaneously
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-primary/30 text-primary hover:bg-primary/10 font-mono"
              onClick={() => window.open("https://ipleak.net", "_blank")}
              data-ocid="dns.visit_ipleak.button"
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              Open ipleak.net
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Prevention Checklist */}
      <Card className="terminal-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-primary">
            DNS Leak Prevention
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {DNS_PREVENTION_STEPS.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex gap-3"
              >
                <CheckCircle className="w-4 h-4 text-[oklch(var(--risk-low))] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-foreground font-medium">
                    {step.label}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {step.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
