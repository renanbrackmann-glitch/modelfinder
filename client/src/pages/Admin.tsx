import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, Upload, FileText, Save, Plus, X, Sparkles,
  CheckCircle, AlertCircle, Lock, ChevronDown, ChevronRight,
  Tag, Layers, RotateCcw, Shield, Eye, EyeOff, GripVertical
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SESSION_KEY = "eproc_admin_auth";

interface PageGroup {
  id?: number;
  title: string;
  tags: string[];
  displayOrder: number;
}

interface ModelRow {
  id: number;
  eprocId: string;
  sigla: string;
  descricao: string;
  tags: string[];
  manualTags: string[] | null;
}

function TagChip({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 rounded-full px-2.5 py-0.5 text-xs font-medium border border-slate-200">
      {tag}
      {onRemove && (
        <button type="button" onClick={onRemove} className="hover:text-red-500 transition-colors ml-0.5">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

function TagInput({
  onAdd,
  suggestions,
  placeholder = "Adicionar tag...",
}: {
  onAdd: (tag: string) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!value.trim()) return [];
    const v = value.toLowerCase();
    return suggestions.filter(s => s.toLowerCase().includes(v) && s.toLowerCase() !== v).slice(0, 8);
  }, [value, suggestions]);

  const handleAdd = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    onAdd(t);
    setValue("");
    setOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={e => { setValue(e.target.value); setOpen(true); }}
          onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); handleAdd(value); }
            if (e.key === "Escape") setOpen(false);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="text-sm h-8 bg-white"
          data-testid="input-add-tag"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 px-2.5"
          onClick={() => handleAdd(value)}
          data-testid="button-confirm-add-tag"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {filtered.map(s => (
            <button
              key={s}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-slate-700 border-b border-slate-100 last:border-0"
              onMouseDown={e => { e.preventDefault(); handleAdd(s); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBanner({ status, onDismiss }: { status: { type: "success" | "error"; message: string } | null; onDismiss?: () => void }) {
  if (!status) return null;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border text-sm animate-in fade-in ${
      status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
    }`}>
      {status.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{status.message}</span>
      {onDismiss && <button onClick={onDismiss}><X className="w-4 h-4 opacity-50 hover:opacity-100" /></button>}
    </div>
  );
}

export default function Admin() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [groups, setGroups] = useState<PageGroup[]>([]);
  const [groupsStatus, setGroupsStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [savingGroups, setSavingGroups] = useState(false);

  const [models, setModels] = useState<ModelRow[]>([]);
  const [modelSearch, setModelSearch] = useState("");
  const [expandedModelId, setExpandedModelId] = useState<number | null>(null);
  const [editingTags, setEditingTags] = useState<Record<number, string[]>>({});
  const [savingModel, setSavingModel] = useState<number | null>(null);
  const [modelStatus, setModelStatus] = useState<{ id: number; status: { type: "success" | "error"; message: string } } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [contentUploadStatus, setContentUploadStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      setIsAuthenticated(true);
      loadData(stored);
    }
  }, []);

  const loadData = async (pwd: string) => {
    const [groupsRes, modelsRes] = await Promise.all([
      fetch("/api/page-groups"),
      fetch("/api/models"),
    ]);
    if (groupsRes.ok) {
      const data = await groupsRes.json();
      setGroups(data.map((g: any) => ({ ...g })));
    }
    if (modelsRes.ok) {
      const data = await modelsRes.json();
      setModels(data.map((m: any) => ({
        id: m.id,
        eprocId: m.eprocId,
        sigla: m.sigla,
        descricao: m.descricao,
        tags: m.tags || [],
        manualTags: m.manualTags ?? null,
      })));
    }
  };

  const handleLogin = async () => {
    if (!password.trim()) return;
    setAuthLoading(true);
    setAuthError(false);
    // #region agent log
    fetch('http://127.0.0.1:7810/ingest/6405b006-79bb-45d6-8a78-271d96e3bb85',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8c138b'},body:JSON.stringify({sessionId:'8c138b',location:'Admin.tsx:202',message:'login attempt started',data:{passwordLength:password.length},timestamp:Date.now(),hypothesisId:'H1,H5'})}).catch(()=>{});
    // #endregion
    try {
      const res = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      // #region agent log
      const rawBody = await res.text();
      console.log('[DEBUG-LOGIN] status:', res.status, 'ok:', res.ok, 'body:', rawBody);
      fetch('http://127.0.0.1:7810/ingest/6405b006-79bb-45d6-8a78-271d96e3bb85',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8c138b'},body:JSON.stringify({sessionId:'8c138b',location:'Admin.tsx:213',message:'api response received',data:{status:res.status,ok:res.ok,body:rawBody.slice(0,500),contentType:res.headers.get('content-type')},timestamp:Date.now(),hypothesisId:'H1,H2,H3'})}).catch(()=>{});
      // #endregion
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, password);
        setIsAuthenticated(true);
        loadData(password);
      } else {
        setAuthError(true);
      }
    } catch(err: any) {
      // #region agent log
      console.log('[DEBUG-LOGIN] fetch error:', err?.name, err?.message, String(err));
      fetch('http://127.0.0.1:7810/ingest/6405b006-79bb-45d6-8a78-271d96e3bb85',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8c138b'},body:JSON.stringify({sessionId:'8c138b',location:'Admin.tsx:223',message:'login fetch threw error',data:{error:String(err),name:err?.name,msg:err?.message},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      setAuthError(true);
    } finally {
      setAuthLoading(false);
    }
  };

  const storedPassword = () => sessionStorage.getItem(SESSION_KEY) || "";

  const allTagSuggestions = useMemo(() => {
    const set = new Set<string>();
    models.forEach(m => m.tags.forEach(t => set.add(t)));
    groups.forEach(g => g.tags.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [models, groups]);

  const filteredModels = useMemo(() => {
    const q = modelSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!q) return models;
    return models.filter(m => {
      const haystack = [m.sigla, m.descricao, ...m.tags].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return haystack.includes(q);
    });
  }, [models, modelSearch]);

  const handleSaveGroups = async () => {
    setSavingGroups(true);
    setGroupsStatus(null);
    try {
      const payload = groups.map((g, i) => ({ title: g.title, tags: g.tags, displayOrder: i }));
      const res = await fetch("/api/admin/page-groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": storedPassword() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setGroupsStatus({ type: "success", message: data.message });
      } else {
        setGroupsStatus({ type: "error", message: data.message });
      }
    } catch {
      setGroupsStatus({ type: "error", message: "Falha na conexão com o servidor" });
    } finally {
      setSavingGroups(false);
      setTimeout(() => setGroupsStatus(null), 5000);
    }
  };

  const handleSaveModelTags = async (modelId: number) => {
    const tags = editingTags[modelId];
    if (!tags) return;
    setSavingModel(modelId);
    setModelStatus(null);
    try {
      const res = await fetch(`/api/admin/models/${modelId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": storedPassword() },
        body: JSON.stringify({ tags }),
      });
      const data = await res.json();
      if (res.ok) {
        setModels(prev => prev.map(m => m.id === modelId ? { ...m, tags, manualTags: tags } : m));
        setModelStatus({ id: modelId, status: { type: "success", message: "Tags salvas com sucesso" } });
      } else {
        setModelStatus({ id: modelId, status: { type: "error", message: data.message } });
      }
    } catch {
      setModelStatus({ id: modelId, status: { type: "error", message: "Falha na conexão" } });
    } finally {
      setSavingModel(null);
      setTimeout(() => setModelStatus(null), 4000);
    }
  };

  const handleResetModelTags = async (modelId: number) => {
    setSavingModel(modelId);
    try {
      const res = await fetch(`/api/admin/models/${modelId}/reset-tags`, {
        method: "PUT",
        headers: { "x-admin-password": storedPassword() },
      });
      const data = await res.json();
      if (res.ok) {
        setModels(prev => prev.map(m => m.id === modelId ? { ...m, manualTags: null } : m));
        setModelStatus({ id: modelId, status: { type: "success", message: "Tags revertidas para automático" } });
        const newEditing = { ...editingTags };
        delete newEditing[modelId];
        setEditingTags(newEditing);
      } else {
        setModelStatus({ id: modelId, status: { type: "error", message: data.message } });
      }
    } catch {
      setModelStatus({ id: modelId, status: { type: "error", message: "Falha na conexão" } });
    } finally {
      setSavingModel(null);
      setTimeout(() => setModelStatus(null), 4000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsUploading(true);
    setUploadStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/models/upload", {
        method: "POST",
        headers: { "x-admin-password": storedPassword() },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus({ type: "success", message: data.message });
        loadData(storedPassword());
      } else {
        setUploadStatus({ type: "error", message: data.message || "Erro ao processar planilha" });
      }
    } catch {
      setUploadStatus({ type: "error", message: "Falha na conexão com o servidor" });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(null), 6000);
    }
  };

  const handleContentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (contentInputRef.current) contentInputRef.current.value = "";
    setIsUploadingContent(true);
    setContentUploadStatus(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/models/upload-content", {
        method: "POST",
        headers: { "x-admin-password": storedPassword() },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const msg = `${data.updated} modelos com íntegra cadastrada${data.skipped > 0 ? ` (${data.skipped} sem conteúdo ignorados)` : ""}`;
        setContentUploadStatus({ type: "success", message: msg });
        loadData(storedPassword());
      } else {
        setContentUploadStatus({ type: "error", message: data.message || "Erro ao processar planilha de íntegras" });
      }
    } catch {
      setContentUploadStatus({ type: "error", message: "Falha na conexão com o servidor" });
    } finally {
      setIsUploadingContent(false);
      setTimeout(() => setContentUploadStatus(null), 6000);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "A nova senha deve ter pelo menos 6 caracteres" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "As senhas não coincidem" });
      return;
    }
    setSavingPassword(true);
    setPasswordStatus(null);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": currentPassword || storedPassword() },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, newPassword);
        setPasswordStatus({ type: "success", message: "Senha alterada com sucesso" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordStatus({ type: "error", message: data.message });
      }
    } catch {
      setPasswordStatus({ type: "error", message: "Falha na conexão" });
    } finally {
      setSavingPassword(false);
      setTimeout(() => setPasswordStatus(null), 6000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-slate-100 rounded-xl mb-3">
              <Lock className="w-6 h-6 text-slate-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Painel de Administração</h1>
            <p className="text-slate-500 text-sm mt-1">Repositório de Modelos eproc</p>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha de administrador"
                value={password}
                onChange={e => { setPassword(e.target.value); setAuthError(false); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className={`pr-10 ${authError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                autoFocus
                data-testid="input-admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {authError && <p className="text-sm text-red-500">Senha incorreta. Tente novamente.</p>}
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={authLoading}
              data-testid="button-admin-login"
            >
              {authLoading ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : "Entrar"}
            </Button>
            <Button variant="ghost" className="w-full text-slate-500" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao repositório
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm transition-colors"
              data-testid="link-back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              Repositório
            </button>
            <span className="text-slate-300">|</span>
            <h1 className="text-slate-900 font-semibold">Painel de Administração</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-600 text-xs"
            onClick={() => { sessionStorage.removeItem(SESSION_KEY); setIsAuthenticated(false); }}
          >
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* SECTION 1: Upload de Planilhas */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Upload className="w-4 h-4 text-slate-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Upload de Planilhas</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div>
                <p className="font-medium text-slate-800 text-sm">Base de Modelos</p>
                <p className="text-slate-500 text-xs mt-0.5">Planilha exportada do eproc com todos os modelos. Importa descrição, sigla, código e classificação.</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xls,.xlsx" onChange={handleFileUpload} />
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-200"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                data-testid="button-upload-xls"
              >
                {isUploading ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Importando...</> : <><Upload className="w-4 h-4 mr-2 text-slate-500" />Atualizar Base (.xls)</>}
              </Button>
              <StatusBanner status={uploadStatus} onDismiss={() => setUploadStatus(null)} />
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div>
                <p className="font-medium text-slate-800 text-sm">Íntegras dos Modelos</p>
                <p className="text-slate-500 text-xs mt-0.5">Planilha com colunas eprocId e conteudo. Vincula o texto completo de cada modelo pelo código.</p>
              </div>
              <input type="file" ref={contentInputRef} className="hidden" accept=".xls,.xlsx" onChange={handleContentUpload} />
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-200"
                onClick={() => contentInputRef.current?.click()}
                disabled={isUploadingContent}
                data-testid="button-upload-content"
              >
                {isUploadingContent ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Carregando...</> : <><FileText className="w-4 h-4 mr-2 text-slate-500" />Carregar Íntegras (.xls)</>}
              </Button>
              <StatusBanner status={contentUploadStatus} onDismiss={() => setContentUploadStatus(null)} />
            </div>
          </div>
        </section>

        {/* SECTION 2: Configurar Página Inicial */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <Layers className="w-4 h-4 text-slate-600" />
              </div>
              <h2 className="font-semibold text-slate-900">Configurar Página Inicial</h2>
            </div>
            <Button
              size="sm"
              onClick={handleSaveGroups}
              disabled={savingGroups}
              data-testid="button-save-groups"
            >
              {savingGroups ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar alterações</>}
            </Button>
          </div>

          <StatusBanner status={groupsStatus} onDismiss={() => setGroupsStatus(null)} />

          <div className="mt-4 space-y-4">
            {groups.map((group, gi) => (
              <div key={gi} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  <Input
                    value={group.title}
                    onChange={e => setGroups(prev => prev.map((g, i) => i === gi ? { ...g, title: e.target.value } : g))}
                    className="font-semibold text-slate-800 border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:border-b focus-visible:border-blue-400 rounded-none text-sm"
                    placeholder="Nome do grupo"
                    data-testid={`input-group-title-${gi}`}
                  />
                  <button
                    type="button"
                    onClick={() => setGroups(prev => prev.filter((_, i) => i !== gi))}
                    className="ml-auto text-slate-300 hover:text-red-400 transition-colors"
                    data-testid={`button-remove-group-${gi}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {group.tags.map((tag, ti) => (
                    <TagChip
                      key={ti}
                      tag={tag}
                      onRemove={() => setGroups(prev => prev.map((g, i) => i === gi
                        ? { ...g, tags: g.tags.filter((_, j) => j !== ti) }
                        : g
                      ))}
                    />
                  ))}
                </div>

                <TagInput
                  suggestions={allTagSuggestions}
                  placeholder="Adicionar etiqueta ao grupo..."
                  onAdd={tag => {
                    if (group.tags.includes(tag)) return;
                    setGroups(prev => prev.map((g, i) => i === gi ? { ...g, tags: [...g.tags, tag] } : g));
                  }}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setGroups(prev => [...prev, { title: "Novo Grupo", tags: [], displayOrder: prev.length }])}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-300 hover:text-blue-400 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              data-testid="button-add-group"
            >
              <Plus className="w-4 h-4" />
              Adicionar Grupo
            </button>
          </div>
        </section>

        {/* SECTION 3: Gerenciar Tags dos Modelos */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Tag className="w-4 h-4 text-slate-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Gerenciar Tags dos Modelos</h2>
            <span className="text-xs text-slate-400 ml-auto">{models.length} modelos</span>
          </div>

          <Input
            value={modelSearch}
            onChange={e => setModelSearch(e.target.value)}
            placeholder="Buscar por sigla, descrição ou tag..."
            className="mb-4"
            data-testid="input-model-search"
          />

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredModels.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">Nenhum modelo encontrado</p>
            )}
            {filteredModels.map(model => {
              const isExpanded = expandedModelId === model.id;
              const currentTags = editingTags[model.id] ?? model.tags;
              const hasManual = model.manualTags !== null;

              return (
                <div
                  key={model.id}
                  className={`border rounded-xl transition-all ${isExpanded ? "border-blue-200 bg-blue-50/30" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 flex items-start gap-3"
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedModelId(null);
                      } else {
                        setExpandedModelId(model.id);
                        if (!editingTags[model.id]) {
                          setEditingTags(prev => ({ ...prev, [model.id]: [...model.tags] }));
                        }
                      }
                    }}
                    data-testid={`button-expand-model-${model.id}`}
                  >
                    <span className="flex-shrink-0 mt-0.5">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{model.sigla}</span>
                        {hasManual && (
                          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">editado manualmente</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 mt-0.5 truncate">{model.descricao}</p>
                      {!isExpanded && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {model.tags.slice(0, 5).map(t => (
                            <span key={t} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                          {model.tags.length > 5 && <span className="text-xs text-slate-400">+{model.tags.length - 5}</span>}
                        </div>
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-200/60 pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {currentTags.map((tag, ti) => (
                          <TagChip
                            key={ti}
                            tag={tag}
                            onRemove={() => setEditingTags(prev => ({
                              ...prev,
                              [model.id]: (prev[model.id] ?? model.tags).filter((_, j) => j !== ti)
                            }))}
                          />
                        ))}
                        {currentTags.length === 0 && (
                          <p className="text-xs text-slate-400 italic">Nenhuma tag — adicione abaixo</p>
                        )}
                      </div>

                      <TagInput
                        suggestions={allTagSuggestions}
                        placeholder="Adicionar tag..."
                        onAdd={tag => {
                          const existing = editingTags[model.id] ?? model.tags;
                          if (existing.includes(tag)) return;
                          setEditingTags(prev => ({ ...prev, [model.id]: [...existing, tag] }));
                        }}
                      />

                      {modelStatus?.id === model.id && (
                        <StatusBanner status={modelStatus.status} />
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleSaveModelTags(model.id)}
                          disabled={savingModel === model.id}
                          data-testid={`button-save-model-tags-${model.id}`}
                        >
                          {savingModel === model.id ? <><Sparkles className="w-3.5 h-3.5 mr-1.5 animate-spin" />Salvando...</> : <><Save className="w-3.5 h-3.5 mr-1.5" />Salvar</>}
                        </Button>
                        {hasManual && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-500 hover:text-red-500"
                            onClick={() => handleResetModelTags(model.id)}
                            disabled={savingModel === model.id}
                            data-testid={`button-reset-model-tags-${model.id}`}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Redefinir para automático
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 ml-auto"
                          onClick={() => setExpandedModelId(null)}
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: Segurança */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Shield className="w-4 h-4 text-slate-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Segurança</h2>
          </div>

          <div className="max-w-sm space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Senha atual</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Confirme sua senha atual"
                data-testid="input-current-password"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Nova senha</label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                data-testid="input-new-password"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Confirmar nova senha</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleChangePassword()}
                placeholder="Repita a nova senha"
                data-testid="input-confirm-password"
              />
            </div>
            <StatusBanner status={passwordStatus} onDismiss={() => setPasswordStatus(null)} />
            <Button
              onClick={handleChangePassword}
              disabled={savingPassword}
              data-testid="button-change-password"
            >
              {savingPassword ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" />Alterando...</> : "Alterar Senha"}
            </Button>
          </div>
        </section>

      </main>
    </div>
  );
}
