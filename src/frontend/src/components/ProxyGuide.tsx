import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Terminal } from "lucide-react";
import { motion } from "motion/react";

function CodeBlock({ children }: { children: string }) {
  return <pre className="code-block text-xs overflow-x-auto">{children}</pre>;
}

function Step({
  number,
  title,
  detail,
  code,
}: {
  number: number;
  title: string;
  detail?: string;
  code?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.07 }}
      className="flex gap-4"
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full border border-primary/40 flex items-center justify-center text-xs font-mono text-primary mt-0.5">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground mb-1">{title}</div>
        {detail && (
          <p className="text-xs text-muted-foreground font-mono mb-2">
            {detail}
          </p>
        )}
        {code && <CodeBlock>{code}</CodeBlock>}
      </div>
    </motion.div>
  );
}

function KillSwitchNote() {
  return (
    <Card className="terminal-card mt-6 border-[oklch(var(--risk-high))/0.3]">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-[oklch(var(--risk-high))] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-[oklch(var(--risk-high))] mb-1">
              Kill Switch — Fail-Closed
            </h4>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              A kill switch ensures that if the proxy connection drops, ALL
              outbound traffic is immediately blocked. Without it, traffic will
              fall back to your real IP. At the OS level, implement firewall
              rules (iptables/nftables on Linux, Windows Firewall, or pf on
              macOS) that only permit traffic through the proxy interface. If
              the proxy interface goes down, the rules deny all traffic by
              default — fail-closed.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProxyGuide() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Proxy Configuration Guide
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          Step-by-step SOCKS5 proxy setup for major browsers and operating
          systems
        </p>
      </div>

      <Tabs defaultValue="firefox">
        <TabsList className="bg-muted/50 border border-border mb-6">
          <TabsTrigger
            value="firefox"
            className="font-mono text-xs"
            data-ocid="proxy.firefox.tab"
          >
            Firefox
          </TabsTrigger>
          <TabsTrigger
            value="chrome"
            className="font-mono text-xs"
            data-ocid="proxy.chrome.tab"
          >
            Chrome
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="font-mono text-xs"
            data-ocid="proxy.system.tab"
          >
            System (Linux/Win/Mac)
          </TabsTrigger>
        </TabsList>

        {/* Firefox Tab */}
        <TabsContent value="firefox" className="space-y-4">
          <Card className="terminal-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2 text-primary">
                <Terminal className="w-4 h-4" />
                Firefox — about:config SOCKS5 Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <Step
                number={1}
                title="Open the configuration editor"
                detail="Navigate to about:config in your address bar and accept the risk warning"
              />
              <Step
                number={2}
                title="Set the following preferences"
                detail="Search for each key and set its value:"
              />
              <CodeBlock>{`network.proxy.type = 1
network.proxy.socks = 127.0.0.1
network.proxy.socks_port = 9050
network.proxy.socks_version = 5
network.proxy.socks_remote_dns = true
network.proxy.no_proxies_on = (empty)`}</CodeBlock>
              <Step
                number={3}
                title="Disable WebRTC to prevent IP leaks"
                detail="Set this key to false:"
              />
              <CodeBlock>{"media.peerconnection.enabled = false"}</CodeBlock>
              <Step
                number={4}
                title="Enable DNS over SOCKS"
                detail="Setting socks_remote_dns = true ensures DNS queries also travel through the proxy, preventing DNS leaks"
              />
              <Step
                number={5}
                title="Verify your proxy is active"
                detail="Visit https://check.torproject.org or https://ipleak.net to confirm the proxy is working"
              />
            </CardContent>
          </Card>
          <KillSwitchNote />
        </TabsContent>

        {/* Chrome Tab */}
        <TabsContent value="chrome" className="space-y-4">
          <Card className="terminal-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2 text-primary">
                <Terminal className="w-4 h-4" />
                Chrome — Command Line SOCKS5 Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <Step
                number={1}
                title="Note: Chrome uses system proxy by default"
                detail="Unlike Firefox, Chrome does not have a built-in SOCKS5 configuration UI. Use command-line flags or system proxy settings:"
              />
              <Step
                number={2}
                title="Launch Chrome with SOCKS5 proxy flag"
                detail="Start Chrome from terminal with these flags:"
              />
              <CodeBlock>{`# Linux / macOS
google-chrome --proxy-server="socks5://127.0.0.1:9050" \\
  --host-resolver-rules="MAP * ~NOTFOUND, EXCLUDE localhost" \\
  --proxy-bypass-list="<-loopback>"

# Windows (PowerShell)
Start-Process "chrome.exe" -ArgumentList \`
  "--proxy-server=socks5://127.0.0.1:9050", \`
  "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost"`}</CodeBlock>
              <Step
                number={3}
                title="Route DNS through the proxy"
                detail="The --host-resolver-rules flag forces all DNS resolution through the SOCKS proxy, preventing DNS leaks"
              />
              <Step
                number={4}
                title="Alternatively, use a proxy extension"
                detail="Extensions like Proxy SwitchyOmega allow per-profile SOCKS5 configuration without restart"
              />
              <Step
                number={5}
                title="Disable WebRTC via chrome://flags"
                detail="Search for WebRTC and set it to 'Disable non-proxied UDP'"
              />
              <CodeBlock>{`# In chrome://flags search:
WebRTC IP Handling Policy → Disable non-proxied UDP`}</CodeBlock>
            </CardContent>
          </Card>
          <KillSwitchNote />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card className="terminal-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2 text-primary">
                <Terminal className="w-4 h-4" />
                System-Level Proxy Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <Step
                number={1}
                title="Linux — Environment Variables"
                detail="Add to ~/.bashrc, ~/.zshrc, or /etc/environment for system-wide effect:"
              />
              <CodeBlock>{`export http_proxy=socks5://127.0.0.1:9050
export https_proxy=socks5://127.0.0.1:9050
export ALL_PROXY=socks5://127.0.0.1:9050
export no_proxy=localhost,127.0.0.1,::1`}</CodeBlock>
              <Step
                number={2}
                title="Linux — iptables Kill Switch"
                detail="These rules enforce fail-closed behavior:"
              />
              <CodeBlock>{`# Allow loopback
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SOCKS proxy port only
iptables -A OUTPUT -d 127.0.0.1 -p tcp --dport 9050 -j ACCEPT

# Block everything else
iptables -A OUTPUT -j DROP`}</CodeBlock>
              <Step
                number={3}
                title="macOS — System Settings"
                detail="System Settings → Network → select your interface → Proxies → SOCKS Proxy"
              />
              <CodeBlock>{`Server: 127.0.0.1
Port: 9050
✓ SOCKS Proxy (SOCKS5)`}</CodeBlock>
              <Step
                number={4}
                title="Windows — System Proxy Settings"
                detail="Settings → Network & Internet → Proxy → Manual proxy setup"
              />
              <CodeBlock>{`# Windows PowerShell (user-level)
netsh winhttp set proxy 127.0.0.1:9050 "<-loopback>"

# Or via registry:
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings
ProxyServer = "socks=127.0.0.1:9050"`}</CodeBlock>
            </CardContent>
          </Card>
          <KillSwitchNote />
        </TabsContent>
      </Tabs>
    </div>
  );
}
