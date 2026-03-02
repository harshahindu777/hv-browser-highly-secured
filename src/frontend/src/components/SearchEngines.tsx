import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddSearchEngine,
  useGetAllSearchEngines,
  useRemoveSearchEngine,
} from "@/hooks/useQueries";
import { ExternalLink, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STATIC_ENGINES = [
  {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com",
    searchUrl: "https://duckduckgo.com/?q=",
    description: "No tracking, no profiling — the classic privacy search",
    tag: "Popular",
  },
  {
    name: "Brave Search",
    url: "https://search.brave.com",
    searchUrl: "https://search.brave.com/search?q=",
    description: "Independent index with no Google/Bing dependency",
    tag: "Independent",
  },
  {
    name: "Startpage",
    url: "https://www.startpage.com",
    searchUrl: "https://www.startpage.com/do/search?q=",
    description: "Google results delivered without any tracking",
    tag: "Proxy",
  },
  {
    name: "Searx",
    url: "https://searx.space",
    searchUrl: "https://searx.space/search?q=",
    description: "Open-source, self-hostable meta-search aggregator",
    tag: "Open Source",
  },
  {
    name: "Whoogle",
    url: "https://benbusby.com/whoogle-search",
    searchUrl: "https://benbusby.com/whoogle-search/search?q=",
    description: "Google results via a privacy-first self-hosted proxy",
    tag: "Self-Host",
  },
];

const DEFAULT_ENGINE_NAME = "DuckDuckGo";
const STORAGE_KEY = "privacyshield_selected_engine";

type EngineOption = {
  name: string;
  searchUrl: string;
  tag?: string;
  isCustom?: boolean;
};

export function SearchEngines() {
  // ─── Search bar state ────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [selectedEngineName, setSelectedEngineName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_ENGINE_NAME;
  });
  const queryInputRef = useRef<HTMLInputElement>(null);

  // ─── Custom engine form state ────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const { data: customEngines, isLoading } = useGetAllSearchEngines();
  const addMutation = useAddSearchEngine();
  const removeMutation = useRemoveSearchEngine();

  // Build the combined options list for the dropdown
  const engineOptions: EngineOption[] = [
    ...STATIC_ENGINES.map((e) => ({
      name: e.name,
      searchUrl: e.searchUrl,
      tag: e.tag,
      isCustom: false,
    })),
    ...(customEngines ?? []).map((e) => ({
      name: e.name,
      searchUrl:
        e.url.endsWith("?q=") || e.url.includes("?") ? e.url : `${e.url}?q=`,
      tag: "Custom",
      isCustom: true,
    })),
  ];

  // Persist selection to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedEngineName);
  }, [selectedEngineName]);

  // Derive the active engine — fall back to DuckDuckGo if the persisted name is gone
  const selectedEngine =
    engineOptions.find((e) => e.name === selectedEngineName) ??
    engineOptions.find((e) => e.name === DEFAULT_ENGINE_NAME) ??
    engineOptions[0];

  function handleSearch() {
    if (!query.trim() || !selectedEngine) return;
    const searchUrl = `${selectedEngine.searchUrl}${encodeURIComponent(query.trim())}`;
    window.open(searchUrl, "_blank", "noopener,noreferrer");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    try {
      await addMutation.mutateAsync({
        name: name.trim(),
        url: url.trim(),
        description: description.trim(),
      });
      setName("");
      setUrl("");
      setDescription("");
      toast.success("Search engine added");
    } catch {
      toast.error("Failed to add search engine");
    }
  }

  async function handleRemove(id: bigint) {
    try {
      await removeMutation.mutateAsync(id);
      toast.success("Search engine removed");
    } catch {
      toast.error("Failed to remove search engine");
    }
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Privacy Search
        </h2>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          Search the web privately — your query never leaves the selected engine
        </p>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Card className="terminal-card-glow relative overflow-hidden">
          {/* Scanline atmosphere */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0 0 0 / 0.03) 2px, oklch(0 0 0 / 0.03) 4px)",
            }}
          />
          <CardContent className="p-5 relative z-10">
            {/* Engine selector + label row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Search via
              </span>
              <Select
                value={selectedEngineName}
                onValueChange={(val) => {
                  setSelectedEngineName(val);
                  queryInputRef.current?.focus();
                }}
              >
                <SelectTrigger
                  className="h-7 w-auto min-w-[160px] text-xs font-mono bg-background border-primary/30 text-primary hover:border-primary/60 focus:ring-primary/40 transition-colors"
                  data-ocid="search.engine.select"
                >
                  <SelectValue placeholder="Select engine" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border font-mono text-xs">
                  {STATIC_ENGINES.map((engine) => (
                    <SelectItem
                      key={engine.name}
                      value={engine.name}
                      className="text-xs focus:bg-primary/10 focus:text-primary"
                    >
                      <span className="font-medium">{engine.name}</span>
                      <span className="ml-2 text-muted-foreground opacity-70">
                        [{engine.tag}]
                      </span>
                    </SelectItem>
                  ))}
                  {(customEngines ?? []).length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-muted-foreground/60 border-t border-border mt-1 pt-2">
                        Custom Engines
                      </div>
                      {(customEngines ?? []).map((engine) => (
                        <SelectItem
                          key={engine.name}
                          value={engine.name}
                          className="text-xs focus:bg-primary/10 focus:text-primary"
                        >
                          <span className="font-medium">{engine.name}</span>
                          <span className="ml-2 text-muted-foreground opacity-70">
                            [Custom]
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Search input + button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 pointer-events-none" />
                <Input
                  ref={queryInputRef}
                  type="text"
                  placeholder={`Search with ${selectedEngine?.name ?? "DuckDuckGo"}…`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="pl-10 h-11 bg-background border-border font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-colors"
                  data-ocid="search.query.input"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!query.trim()}
                className="h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-medium transition-all disabled:opacity-40"
                data-ocid="search.submit_button"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Engine info row */}
            {selectedEngine && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground/60 font-mono truncate">
                  → {selectedEngine.searchUrl}
                  <span className="text-primary/50">{"{query}"}</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Curated Engines Grid ────────────────────────────────────────────── */}
      <div className="mb-3">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
          Curated Private Engines
        </h3>
      </div>
      <div className="grid gap-3 mb-8">
        {STATIC_ENGINES.map((engine, idx) => (
          <motion.div
            key={engine.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.06 }}
          >
            <Card
              className={`terminal-card cursor-pointer transition-all duration-150 hover:border-primary/40 ${
                selectedEngineName === engine.name
                  ? "border-primary/50 bg-primary/5"
                  : ""
              }`}
              onClick={() => {
                setSelectedEngineName(engine.name);
                queryInputRef.current?.focus();
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {engine.name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-mono badge-low">
                        {engine.tag}
                      </span>
                      {selectedEngineName === engine.name && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-primary/15 text-primary border border-primary/30">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {engine.description}
                    </p>
                    <p className="text-xs text-primary/60 font-mono mt-1">
                      {engine.url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEngineName(engine.name);
                        queryInputRef.current?.focus();
                      }}
                    >
                      Use
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:bg-accent font-mono text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          engine.url,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1.5" />
                      Visit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Custom Search Engines ───────────────────────────────────────────── */}
      <Card className="terminal-card-glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono flex items-center gap-2 text-primary">
            <Search className="w-4 h-4" />
            Custom Search Engines
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {/* Add form */}
          <form onSubmit={handleAdd} className="space-y-3 mb-6">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="search-name"
                  className="text-xs text-muted-foreground font-mono mb-1 block"
                >
                  Name
                </label>
                <Input
                  id="search-name"
                  placeholder="My Search Engine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border font-mono text-sm h-8"
                  data-ocid="search.add.input"
                />
              </div>
              <div>
                <label
                  htmlFor="search-url"
                  className="text-xs text-muted-foreground font-mono mb-1 block"
                >
                  URL (include <code className="text-primary/80">?q=</code>)
                </label>
                <Input
                  id="search-url"
                  placeholder="https://example.com/search?q="
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-background border-border font-mono text-sm h-8"
                  data-ocid="search.url.input"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="search-desc"
                className="text-xs text-muted-foreground font-mono mb-1 block"
              >
                Description
              </label>
              <Input
                id="search-desc"
                placeholder="Short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background border-border font-mono text-sm h-8"
                data-ocid="search.description.input"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || !url.trim() || addMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
              data-ocid="search.add_button"
            >
              {addMutation.isPending ? (
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              ) : (
                <Plus className="w-3 h-3 mr-2" />
              )}
              Add Engine
            </Button>
          </form>

          {/* List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded" />
              ))}
            </div>
          ) : !customEngines || customEngines.length === 0 ? (
            <div
              className="text-center py-8 text-muted-foreground font-mono text-sm border border-dashed border-border rounded"
              data-ocid="search.list.empty_state"
            >
              No custom engines yet — add one above
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {customEngines.map((engine, idx) => (
                  <motion.div
                    key={engine.id.toString()}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between gap-3 p-3 rounded border border-border bg-background/50"
                    data-ocid={`search.item.${idx + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {engine.name}
                      </div>
                      <div className="text-xs text-primary/70 font-mono truncate">
                        {engine.url}
                      </div>
                      {engine.description && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {engine.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs"
                        onClick={() => {
                          setSelectedEngineName(engine.name);
                          queryInputRef.current?.focus();
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Use
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(engine.id)}
                        disabled={removeMutation.isPending}
                        data-ocid={`search.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
