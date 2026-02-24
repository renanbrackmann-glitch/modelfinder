import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModelEntry } from "@/data/models";
import { ModelContentSheet } from "@/components/ModelContentSheet";
import { cn } from "@/lib/utils";

interface ModelCardProps {
  model: ModelEntry;
  onTagClick: (tag: string) => void;
}

export function ModelCard({ model, onTagClick }: ModelCardProps) {
  const [copied, setCopied] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(model.sigla);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onTagClick(tag);
  };

  const descParts = model.descricao.split(" - ");
  const descPrefix = descParts.length > 1 ? descParts[0] + " - " : "";
  const descBody = descParts.length > 1 ? descParts.slice(1).join(" - ") : model.descricao;

  const hasContent = !!model.conteudo;
  const canOpenSheet = model.dbId > 0;

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden border transition-all bg-white",
          canOpenSheet
            ? "cursor-pointer hover:shadow-md hover:border-blue-200 hover:bg-blue-50/20"
            : "hover:shadow-md hover:border-slate-300"
        )}
        onClick={() => canOpenSheet && setSheetOpen(true)}
        data-testid={`card-model-${model.id}`}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: model.corHex }}
        />

        <CardContent className="p-5 pl-6 flex flex-col h-full gap-4">
          <div className="flex-1">
            <p className="text-slate-800 leading-relaxed font-medium text-[15px]">
              {descPrefix && (
                <span className="font-bold text-slate-900 tracking-tight mr-1">
                  {descPrefix}
                </span>
              )}
              <span className="text-slate-600 font-normal leading-relaxed">
                {descBody}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-auto pt-4 border-t border-slate-100">

            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="secondary"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors border-0"
                onClick={(e) => handleTagClick(e, model.categoria)}
              >
                {model.categoria}
              </Badge>
              {model.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-slate-500 hover:text-slate-700 hover:border-slate-300 cursor-pointer transition-colors bg-white font-normal"
                  onClick={(e) => handleTagClick(e, tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {canOpenSheet && (
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors",
                    hasContent
                      ? "text-blue-600 bg-blue-50 border border-blue-100 opacity-0 group-hover:opacity-100"
                      : "text-slate-400 opacity-0 group-hover:opacity-100"
                  )}
                  title={hasContent ? "Ver íntegra" : "Íntegra não disponível"}
                >
                  <FileText className="w-3 h-3" />
                  {hasContent ? "Ver íntegra" : "Sem íntegra"}
                </span>
              )}

              <div className="flex items-center gap-2 bg-slate-50 rounded-md px-3 py-1.5 border border-slate-100">
                <code className="text-sm font-mono text-slate-600 font-medium whitespace-nowrap">
                  {model.sigla}
                </code>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    copied
                      ? "bg-green-100 text-green-700"
                      : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                  )}
                  title="Copiar sigla"
                  data-testid={`button-copy-${model.id}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {canOpenSheet && (
        <ModelContentSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          dbId={model.dbId}
          sigla={model.sigla}
          descricao={model.descricao}
          categoria={model.categoria}
          corHex={model.corHex}
          tags={model.tags}
        />
      )}
    </>
  );
}
