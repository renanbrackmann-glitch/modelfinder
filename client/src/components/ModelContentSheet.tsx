import { useState, useEffect } from "react";
import { Copy, Check, FileText, Loader2, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModelContentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dbId: number;
  sigla: string;
  descricao: string;
  categoria: string;
  corHex: string;
  tags: string[];
}

function CopyBtn({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-2", className)}
      onClick={handleCopy}
      data-testid={`button-copy-${label}`}
    >
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copiado!" : label}
    </Button>
  );
}

export function ModelContentSheet({
  open,
  onOpenChange,
  dbId,
  sigla,
  descricao,
  categoria,
  corHex,
  tags,
}: ModelContentSheetProps) {
  const [conteudo, setConteudo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || dbId <= 0) return;
    setLoading(true);
    setError(false);
    setConteudo(null);

    fetch(`/api/models/${dbId}`)
      .then(r => r.json())
      .then(data => {
        setConteudo(data.conteudo ?? null);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [open, dbId]);

  const descParts = descricao.split(" - ");
  const descPrefix = descParts.length > 1 ? descParts[0] + " - " : "";
  const descBody = descParts.length > 1 ? descParts.slice(1).join(" - ") : descricao;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl flex flex-col p-0 gap-0 bg-white"
        data-testid="sheet-model-content"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-200">
          <div className="flex items-stretch gap-0">
            <div className="w-1.5 flex-shrink-0 rounded-tl-lg" style={{ backgroundColor: corHex }} />
            <SheetHeader className="flex-1 px-6 pt-6 pb-5 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="text-xs font-semibold border-0" style={{ backgroundColor: corHex, color: "#1e293b" }}>
                  {categoria}
                </Badge>
                {tags.filter(t => t !== categoria).slice(0, 3).map(t => (
                  <Badge key={t} variant="outline" className="text-xs text-slate-500 font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
              <SheetTitle className="text-base font-normal text-left leading-snug">
                {descPrefix && <span className="font-bold text-slate-900">{descPrefix}</span>}
                <span className="text-slate-600">{descBody}</span>
              </SheetTitle>
              <div className="flex items-center gap-1.5 mt-2">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <code className="text-sm font-mono text-slate-500">{sigla}</code>
              </div>
              <SheetDescription className="sr-only">
                Íntegra do modelo {sigla} — {categoria}
              </SheetDescription>
            </SheetHeader>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando íntegra...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 py-10 text-slate-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Não foi possível carregar o conteúdo. Tente novamente.</p>
            </div>
          )}

          {!loading && !error && conteudo === null && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-3 rounded-xl bg-slate-100 mb-4">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-sm">Íntegra não disponível</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
                O conteúdo completo deste modelo ainda não foi cadastrado. Faça o upload da planilha de íntegras no painel administrativo.
              </p>
            </div>
          )}

          {!loading && !error && conteudo !== null && (
            <pre
              className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-slate-800"
              data-testid="text-model-content"
            >
              {conteudo}
            </pre>
          )}
        </div>

        {/* Footer with copy actions */}
        <div className="flex-shrink-0 border-t border-slate-200 px-6 py-4 flex items-center gap-3 bg-slate-50/50">
          <CopyBtn text={sigla} label="Copiar Sigla" />
          {conteudo && (
            <CopyBtn
              text={conteudo}
              label="Copiar Íntegra"
              className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            />
          )}
          <span className="text-xs text-slate-400 ml-auto">
            {conteudo ? `${conteudo.length.toLocaleString("pt-BR")} caracteres` : ""}
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
