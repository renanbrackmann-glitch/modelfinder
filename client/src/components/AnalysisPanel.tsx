import { X, CheckCircle2, AlertCircle, MinusCircle, Copy, Check, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModelContentSheet } from "@/components/ModelContentSheet";

interface ModelSuggestion {
  id: number;
  sigla: string;
  descricao: string;
  categoria: string;
  corHex: string;
  tags: string[];
}

interface Questao {
  descricao: string;
  forca: "direto" | "parcial" | "ausente";
  modelos: ModelSuggestion[];
  observacao?: string;
}

interface Secao {
  titulo: string;
  questoes: Questao[];
}

export interface AnalysisResult {
  tipoRecurso: string;
  recorrente: string;
  recorrido: string;
  decisaoRecorrida: string;
  secoes: Secao[];
}

interface AnalysisPanelProps {
  analysis: AnalysisResult;
  onClose: () => void;
}

const SECAO_META: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  "ESTRUTURA":           { icon: "📋", color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200" },
  "ADMISSIBILIDADE":     { icon: "⚖️", color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200"  },
  "PRELIMINARES E MÉRITO": { icon: "📜", color: "text-blue-700",  bg: "bg-blue-50",     border: "border-blue-200"   },
  "DISPOSITIVO":         { icon: "💰", color: "text-purple-700",  bg: "bg-purple-50",   border: "border-purple-200" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold transition-all border",
        copied
          ? "bg-green-100 text-green-700 border-green-200"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
      )}
      title="Copiar sigla para usar no eproc"
      data-testid={`button-copy-sigla-${text}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {text}
    </button>
  );
}

function ModelCard({ model }: { model: ModelSuggestion }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const descParts = model.descricao.split(" - ");
  const descPrefix = descParts.length > 1 ? descParts[0] + " - " : "";
  const descBody = descParts.length > 1 ? descParts.slice(1).join(" - ") : model.descricao;

  return (
    <>
      <div
        className="flex items-stretch gap-0 bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all"
        data-testid={`analysis-model-${model.id}`}
      >
        <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: model.corHex }} />
        <div className="flex-1 px-4 py-3 min-w-0">
          <p className="text-[14px] text-slate-800 leading-snug">
            {descPrefix && <span className="font-bold text-slate-900">{descPrefix}</span>}
            <span className="font-normal text-slate-600">{descBody}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 pr-4 pl-2 flex-shrink-0">
          <button
            onClick={() => setSheetOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border bg-slate-50 text-slate-500 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
            title="Ver íntegra do modelo"
            data-testid={`button-view-content-${model.id}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Íntegra
          </button>
          <CopyButton text={model.sigla} />
        </div>
      </div>

      <ModelContentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        dbId={model.id}
        sigla={model.sigla}
        descricao={model.descricao}
        categoria={model.categoria}
        corHex={model.corHex}
        tags={model.tags}
      />
    </>
  );
}

function QuestaoItem({ questao, index }: { questao: Questao; index: number }) {
  const [open, setOpen] = useState(true);

  const forcaConfig = {
    direto:  { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, label: "Correspondência direta",  labelClass: "text-green-600 bg-green-50 border-green-100" },
    parcial: { icon: <AlertCircle  className="w-4 h-4 text-amber-500" />, label: "Correspondência parcial", labelClass: "text-amber-600 bg-amber-50 border-amber-100"  },
    ausente: { icon: <MinusCircle  className="w-4 h-4 text-slate-400" />, label: "Sem modelo disponível",   labelClass: "text-slate-500 bg-slate-50 border-slate-100"  },
  }[questao.forca];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/70 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-slate-400 font-mono text-sm font-bold mt-0.5 w-5 flex-shrink-0">{index}.</span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-slate-800 leading-snug">{questao.descricao}</p>
          <div className="flex items-center gap-2 mt-1.5">
            {forcaConfig.icon}
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", forcaConfig.labelClass)}>
              {forcaConfig.label}
            </span>
            {questao.modelos.length > 0 && (
              <span className="text-xs text-slate-400">
                {questao.modelos.length} modelo{questao.modelos.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        {(questao.modelos.length > 0 || questao.observacao) && (
          <div className="flex-shrink-0 mt-0.5">
            {open
              ? <ChevronUp className="w-4 h-4 text-slate-400" />
              : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        )}
      </button>

      {open && (questao.modelos.length > 0 || questao.observacao) && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-2.5 bg-white/50">
          {questao.modelos.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
          {questao.observacao && (
            <p className="text-xs text-slate-500 italic leading-relaxed pt-1 px-1">{questao.observacao}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SecaoBlock({ secao }: { secao: Secao }) {
  if (secao.questoes.length === 0) return null;
  const meta = SECAO_META[secao.titulo] ?? { icon: "•", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" };

  let questionIndex = 1;

  return (
    <div className="space-y-3">
      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold uppercase tracking-widest", meta.bg, meta.color, meta.border)}>
        <span>{meta.icon}</span>
        {secao.titulo}
      </div>
      <div className="space-y-3">
        {secao.questoes.map((q, i) => (
          <QuestaoItem key={i} questao={q} index={questionIndex++} />
        ))}
      </div>
    </div>
  );
}

export function AnalysisPanel({ analysis, onClose }: AnalysisPanelProps) {
  const allQuestoes = analysis.secoes.flatMap(s => s.questoes);
  const totalModelos = new Set(allQuestoes.flatMap(q => q.modelos.map(m => m.id))).size;
  const totalQuestoes = allQuestoes.length;
  const semModelo = allQuestoes.filter(q => q.forca === "ausente").length;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-400">

      {/* Header do resultado */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
        <div className="flex items-start justify-between p-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-900">Análise do Recurso</h2>
                <Badge className="bg-blue-600 text-white text-xs font-semibold border-0">{analysis.tipoRecurso}</Badge>
              </div>
              <p className="text-sm text-slate-500 leading-snug line-clamp-2">{analysis.decisaoRecorrida}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-700 flex-shrink-0"
            onClick={onClose}
            data-testid="button-close-analysis"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-6 pb-5 flex flex-wrap gap-x-6 gap-y-1 text-sm border-t border-slate-100 pt-4">
          <p><span className="font-semibold text-slate-700">Recorrente: </span><span className="text-slate-500">{analysis.recorrente}</span></p>
          <p><span className="font-semibold text-slate-700">Recorrido: </span><span className="text-slate-500">{analysis.recorrido}</span></p>
        </div>

        <div className="px-6 pb-5 flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <span className="text-xl font-bold text-slate-900">{totalQuestoes}</span>
            <span className="text-xs text-slate-500 font-medium">questões<br/>identificadas</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 border border-green-100">
            <span className="text-xl font-bold text-green-700">{totalModelos}</span>
            <span className="text-xs text-green-600 font-medium">modelos<br/>sugeridos</span>
          </div>
          {semModelo > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
              <span className="text-xl font-bold text-amber-700">{semModelo}</span>
              <span className="text-xs text-amber-600 font-medium">sem modelo<br/>disponível</span>
            </div>
          )}
        </div>
      </div>

      {/* Seções */}
      <div className="space-y-8">
        {analysis.secoes.map((secao, i) => (
          <SecaoBlock key={i} secao={secao} />
        ))}
      </div>
    </div>
  );
}
