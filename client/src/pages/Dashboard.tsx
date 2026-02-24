import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, X, Inbox, FileText, Sparkles, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModelCard } from "@/components/ModelCard";
import { AnalysisPanel, AnalysisResult } from "@/components/AnalysisPanel";
import { models as fallbackModels, searchModels, getDisplayName, ModelEntry } from "@/data/models";

function normalize(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function dbModelToEntry(m: any): ModelEntry {
  return {
    id: String(m.eprocId ?? m.id),
    dbId: Number(m.id),
    orgao: m.orgao,
    descricao: m.descricao,
    sigla: m.sigla,
    classificacaoOriginal: m.classificacaoOriginal,
    categoria: m.categoria,
    tags: m.tags || [],
    unifiedTags: m.unifiedTags || [],
    corHex: m.corHex,
    conteudo: m.conteudo ?? null,
  };
}

interface PageGroup {
  id: number;
  title: string;
  tags: string[];
  displayOrder: number;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [dbModels, setDbModels] = useState<ModelEntry[] | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [pageGroups, setPageGroups] = useState<PageGroup[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/models")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbModels(data.map(dbModelToEntry));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingModels(false));

    fetch("/api/page-groups")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPageGroups(data);
      })
      .catch(() => {});
  }, []);

  const activeModels = dbModels ?? fallbackModels;

  const results = useMemo(() => {
    return searchModels(query, selectedTags.map(normalize), activeModels);
  }, [query, selectedTags, activeModels]);

  const handlePdfAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pdfInputRef.current) pdfInputRef.current.value = "";

    setIsAnalyzing(true);
    setAnalyzeStatus(null);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/analyze-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.secoes) {
        setAnalysisResult(data);
      } else {
        setAnalyzeStatus({ type: "error", message: data.message || "Erro ao analisar PDF" });
        setTimeout(() => setAnalyzeStatus(null), 6000);
      }
    } catch {
      setAnalyzeStatus({ type: "error", message: "Falha na conexão com o servidor" });
      setTimeout(() => setAnalyzeStatus(null), 6000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTagToggle = (tagOriginalText: string) => {
    const norm = normalize(tagOriginalText);
    const displayName = getDisplayName(norm) || tagOriginalText;
    if (selectedTags.some(t => normalize(t) === norm)) {
      setSelectedTags(prev => prev.filter(t => normalize(t) !== norm));
    } else {
      setSelectedTags(prev => [...prev, displayName]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const clearAll = () => {
    setQuery("");
    setSelectedTags([]);
  };

  const hasActiveFilters = query.trim().length > 0 || selectedTags.length > 0;
  const showPanel = analysisResult !== null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 selection:bg-blue-100 pb-20">
      <div className="flex flex-col flex-1 min-w-0">

        <header className="sticky top-0 z-10 glass border-b border-slate-200/60 pb-6 pt-10 px-6 sm:px-12 transition-all duration-300">
          <div className="max-w-4xl mx-auto w-full">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">Gabinete RJL - Consulta de Modelos</h1>
                <p className="text-slate-500 text-sm font-medium">
                  {isLoadingModels ? "Carregando..." : `${activeModels.length} modelos disponíveis`}
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePdfAnalysis} />

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => navigate("/admin")}
                  data-testid="button-admin"
                >
                  <Settings className="w-4 h-4 mr-1.5" />
                  Admin
                </Button>

                <Button
                  size="sm"
                  className={`flex-1 sm:flex-none shadow-sm ${showPanel ? "bg-blue-700 hover:bg-blue-800 text-white shadow-blue-300" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"}`}
                  onClick={() => {
                    if (showPanel) {
                      setAnalysisResult(null);
                    } else {
                      pdfInputRef.current?.click();
                    }
                  }}
                  disabled={isAnalyzing}
                  data-testid="button-analyze-pdf"
                >
                  {isAnalyzing
                    ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Analisando...</>
                    : showPanel
                      ? <><X className="w-4 h-4 mr-2" />Fechar Análise</>
                      : <><FileText className="w-4 h-4 mr-2" />Analisar Recurso (PDF)</>
                  }
                </Button>
              </div>
            </div>

            {analyzeStatus && (
              <div className={`mb-4 p-3 rounded-lg border flex items-center gap-3 text-sm animate-in fade-in ${
                analyzeStatus.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {analyzeStatus.type === "success"
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {analyzeStatus.message}
              </div>
            )}

            <div className={`relative transition-all duration-300 ${isFocused ? "ring-4 ring-blue-500/10 rounded-xl" : ""}`}>
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Pesquisar por assunto, tese ou palavra-chave..."
                className="pl-12 pr-12 py-6 text-lg bg-white border-slate-200 shadow-sm rounded-xl focus-visible:ring-blue-500 focus-visible:border-blue-500 placeholder:text-slate-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                data-testid="input-search"
              />
              {hasActiveFilters && (
                <button onClick={clearAll} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors" data-testid="button-clear-search">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                {selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/50 pl-3 pr-2 py-1 gap-1 text-sm font-medium"
                    data-testid={`tag-active-${tag}`}
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="p-0.5 ml-1 rounded-full hover:bg-blue-200"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className={`flex-1 w-full mx-auto px-6 sm:px-12 py-8 ${showPanel ? "max-w-5xl" : "max-w-4xl"}`}>

          {showPanel && analysisResult && (
            <AnalysisPanel
              analysis={analysisResult}
              onClose={() => setAnalysisResult(null)}
            />
          )}

          {!showPanel && !hasActiveFilters && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="text-center max-w-lg mx-auto mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-blue-50 border border-blue-100 mb-4">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Selecione um ponto de partida</h2>
                <p className="text-slate-500 text-sm">Filtre por competência, fase ou natureza — ou pesquise diretamente acima.</p>
              </div>

              {pageGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {pageGroups.map((group) => (
                    <div key={group.id} className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <span className="w-1 h-3 bg-blue-400 rounded-full mr-2" />
                        {group.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {group.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-white hover:border-blue-400 hover:text-blue-600 text-slate-600 bg-slate-50/50 py-1.5 px-3 transition-all border-slate-200 font-medium text-xs"
                            onClick={() => handleTagToggle(tag)}
                            data-testid={`tag-suggest-${tag}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center py-8 text-slate-400 text-sm">
                  Carregando grupos...
                </div>
              )}
            </div>
          )}

          {!showPanel && hasActiveFilters && (
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider" data-testid="text-results-count">
                {results.length} {results.length === 1 ? "resultado" : "resultados"}
              </h2>

              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                  <Inbox className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-700">Nenhum modelo encontrado</h3>
                  <p className="text-slate-500 mt-1 text-sm">Tente outros termos ou remova alguns filtros.</p>
                  <Button variant="outline" className="mt-6 border-slate-200" onClick={clearAll} data-testid="button-clear-filters">
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {results.map(model => (
                    <ModelCard key={model.id} model={model} onTagClick={handleTagToggle} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
