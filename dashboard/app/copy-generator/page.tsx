'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Instagram,
  Facebook,
  Linkedin,
  Heart,
  Download,
  FileText,
  Megaphone,
  Gift,
  BookOpen,
  Coffee,
  MessageSquare,
  Calendar,
  Star,
  History,
  Languages,
  Palette,
  Eye
} from "lucide-react";

// Types
interface GeneratedContent {
  headline: string;
  body: string;
  cta: string;
  hashtags: string[];
}

interface GenerationResult {
  content: GeneratedContent;
  metadata: {
    provider: string;
    model: string;
    agentsUsed: string[];
  };
}

interface HistoryItem extends GenerationResult {
  id: string;
  timestamp: number;
  platform: string;
  contentType: string;
  model?: string;
  topic?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  platform: string;
  contentType: string;
  model?: string;
  topic: string;
  tone: string;
}

// Platform options with character limits
const platforms = [
  { id: 'instagram_feed', label: 'Instagram Feed', icon: Instagram, charLimit: 2200 },
  { id: 'instagram_stories', label: 'Instagram Stories', icon: Instagram, charLimit: 125 },
  { id: 'instagram_reels', label: 'Instagram Reels', icon: Instagram, charLimit: 2200 },
  { id: 'facebook', label: 'Facebook Post', icon: Facebook, charLimit: 63206 },
  { id: 'linkedin', label: 'LinkedIn Post', icon: Linkedin, charLimit: 3000 },
];

// Content types with icons
const contentTypes = [
  { id: 'novo_modelo', label: 'Novo Modelo', icon: Sparkles },
  { id: 'entrega', label: 'Entrega de Viatura', icon: Gift },
  { id: 'evento', label: 'Evento/Lançamento', icon: Calendar },
  { id: 'promocao', label: 'Promoção', icon: Megaphone },
  { id: 'educativo', label: 'Conteúdo Educativo', icon: BookOpen },
  { id: 'lifestyle', label: 'Lifestyle', icon: Coffee },
  { id: 'engagement', label: 'Engagement', icon: MessageSquare },
];

// Tone options
const tones = [
  { id: 'formal', label: 'Formal', emoji: '🎩' },
  { id: 'casual', label: 'Casual', emoji: '😊' },
  { id: 'luxurious', label: 'Luxurious', emoji: '💎' },
  { id: 'sporty', label: 'Sporty', emoji: '🏁' },
];

// Language options
const languages = [
  { id: 'pt', label: 'Português', flag: '🇵🇹' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
];

// Mercedes models for autocomplete
const mercedesModels = [
  'Classe A', 'Classe A 180', 'Classe A 200', 'AMG A 35', 'AMG A 45 S',
  'Classe B', 'CLA', 'CLA 200', 'AMG CLA 35', 'AMG CLA 45 S',
  'GLA', 'GLA 200', 'AMG GLA 35', 'GLB', 'GLB 200',
  'Classe C', 'Classe C 200', 'Classe C 300', 'AMG C 43', 'AMG C 63 S',
  'GLC', 'GLC 200', 'GLC 300', 'AMG GLC 43', 'AMG GLC 63 S',
  'Classe E', 'Classe E 200', 'Classe E 300', 'AMG E 53', 'AMG E 63 S',
  'GLE', 'GLE 300 d', 'GLE 450', 'AMG GLE 53', 'AMG GLE 63 S',
  'GLS', 'GLS 400 d', 'GLS 450', 'AMG GLS 63',
  'Classe S', 'Classe S 400 d', 'Classe S 500', 'AMG S 63',
  'EQA', 'EQA 250+', 'EQB', 'EQB 250+',
  'EQE', 'EQE 350+', 'AMG EQE 53',
  'EQS', 'EQS 450+', 'AMG EQS 53',
  'AMG GT', 'AMG GT 55', 'AMG GT 63',
  'AMG SL', 'AMG SL 55', 'AMG SL 63',
  'Classe G', 'G 500', 'AMG G 63', 'G 580 EQ',
];

// Pre-made templates
const templates: Template[] = [
  {
    id: 't1',
    name: 'Lançamento AMG',
    description: 'Template para lançamento de modelos AMG',
    platform: 'instagram_feed',
    contentType: 'novo_modelo',
    model: 'AMG GT 63',
    topic: 'Novo AMG GT chega ao stock',
    tone: 'sporty'
  },
  {
    id: 't2',
    name: 'Entrega Luxo',
    description: 'Template elegante para entrega de viaturas premium',
    platform: 'instagram_feed',
    contentType: 'entrega',
    model: 'Classe S 500',
    topic: 'Entrega de Classe S ao cliente VIP',
    tone: 'luxurious'
  },
  {
    id: 't3',
    name: 'Evento Test-Drive',
    description: 'Convite para evento de test-drive',
    platform: 'facebook',
    contentType: 'evento',
    topic: 'Weekend Test-Drive na Finiclasse',
    tone: 'casual'
  },
  {
    id: 't4',
    name: 'Promoção EQ',
    description: 'Promoção de modelos elétricos',
    platform: 'linkedin',
    contentType: 'promocao',
    model: 'EQE 350+',
    topic: 'Promoção exclusiva gama EQ',
    tone: 'formal'
  },
];

export default function CopyGeneratorPage() {
  // Form state
  const [platform, setPlatform] = useState('instagram_feed');
  const [contentType, setContentType] = useState('novo_modelo');
  const [model, setModel] = useState('');
  const [topic, setTopic] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [provider, setProvider] = useState<'groq' | 'gemini'>('groq');
  const [tone, setTone] = useState('luxurious');
  const [language, setLanguage] = useState('pt');

  // Result state
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // UI state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // History and favorites
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load history and favorites from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('finiclasse_copy_history');
    const savedFavorites = localStorage.getItem('finiclasse_copy_favorites');

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
  }, []);

  // Model suggestions
  const filteredModels = mercedesModels.filter(m =>
    m.toLowerCase().includes(model.toLowerCase())
  );

  // Calculate character count
  const getFullText = () => {
    if (!result) return '';
    return `${result.content.headline}

${result.content.body}

${result.content.cta}

${result.content.hashtags.map(h => `#${h.replace('#', '')}`).join(' ')}`;
  };

  const charCount = getFullText().length;
  const currentPlatform = platforms.find(p => p.id === platform);
  const charLimit = currentPlatform?.charLimit || 0;
  const charPercentage = (charCount / charLimit) * 100;

  // Generate copy
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          contentType,
          model: model || undefined,
          topic: topic || undefined,
          additionalContext: `${additionalContext}${additionalContext ? '\n' : ''}Tom: ${tone}\nIdioma: ${language}`,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate');
      }

      setResult(data);

      // Add to history
      const historyItem: HistoryItem = {
        ...data,
        id: Date.now().toString(),
        timestamp: Date.now(),
        platform,
        contentType,
        model,
        topic,
      };

      const newHistory = [historyItem, ...history].slice(0, 50); // Keep last 50
      setHistory(newHistory);
      localStorage.setItem('finiclasse_copy_history', JSON.stringify(newHistory));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!result) return;

    const text = getFullText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download as TXT
  const handleDownload = () => {
    if (!result) return;

    const text = getFullText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finiclasse-copy-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];

    setFavorites(newFavorites);
    localStorage.setItem('finiclasse_copy_favorites', JSON.stringify(newFavorites));
  };

  // Load template
  const loadTemplate = (template: Template) => {
    setPlatform(template.platform);
    setContentType(template.contentType);
    setModel(template.model || '');
    setTopic(template.topic);
    setTone(template.tone);
    setShowTemplates(false);
  };

  // Load from history
  const loadFromHistory = (item: HistoryItem) => {
    setResult(item);
    setPlatform(item.platform);
    setContentType(item.contentType);
    setModel(item.model || '');
    setTopic(item.topic || '');
    setShowHistory(false);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Copy Generator
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Gerador de conteúdo AI para marketing Mercedes-Benz Finiclasse
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplates(true)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowHistory(true)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            Histórico
            {history.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-foreground text-background text-xs rounded-full">
                {history.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Configuração</CardTitle>
              <CardDescription>
                Define os parâmetros para gerar o copy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Plataforma</label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatform(p.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          platform === p.id
                            ? 'border-amg bg-amg/5 text-amg'
                            : 'border-border hover:border-arrow'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Conteúdo</label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((ct) => {
                    const Icon = ct.icon;
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => setContentType(ct.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                          contentType === ct.id
                            ? 'bg-foreground text-background'
                            : 'bg-steel/10 hover:bg-steel/20'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {ct.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone and Language */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Tom
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {tones.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTone(t.id)}
                        className={`px-2 py-1.5 rounded-lg text-xs transition-all ${
                          tone === t.id
                            ? 'bg-foreground text-background'
                            : 'bg-steel/10 hover:bg-steel/20'
                        }`}
                      >
                        {t.emoji} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Idioma
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLanguage(l.id)}
                        className={`px-2 py-1.5 rounded-lg text-xs transition-all ${
                          language === l.id
                            ? 'bg-foreground text-background'
                            : 'bg-steel/10 hover:bg-steel/20'
                        }`}
                      >
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-2 relative">
                <label className="text-sm font-medium">Modelo Mercedes-Benz (opcional)</label>
                <Input
                  placeholder="Ex: GLC 300, AMG GT, EQS..."
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && model && filteredModels.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto bg-white border rounded-lg shadow-lg">
                    {filteredModels.slice(0, 8).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-steel/10"
                        onMouseDown={() => {
                          setModel(m);
                          setShowSuggestions(false);
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tema/Tópico (opcional)</label>
                <Input
                  placeholder="Ex: Chegada ao stock, Test-drive de verão..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Additional Context */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Contexto Adicional (opcional)</label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amg"
                  placeholder="Informações adicionais: cor do carro, nome do cliente, evento específico..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                />
              </div>

              {/* AI Provider */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo AI</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProvider('groq')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                      provider === 'groq'
                        ? 'bg-foreground text-background'
                        : 'bg-steel/10 hover:bg-steel/20'
                    }`}
                  >
                    Groq (Llama 3.3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('gemini')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                      provider === 'gemini'
                        ? 'bg-foreground text-background'
                        : 'bg-steel/10 hover:bg-steel/20'
                    }`}
                  >
                    Gemini Flash
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                className="w-full bg-amg hover:bg-amg/90 text-white"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    A gerar...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Copy
                  </>
                )}
              </Button>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  <strong>Erro:</strong> {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        <div className="space-y-6">
          <Card className={`border-2 ${result ? 'border-amg/30' : 'border-dashed'}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className={result ? 'text-foreground' : 'text-muted-foreground'}>
                    Conteúdo Gerado
                  </CardTitle>
                  <CardDescription>
                    {result
                      ? `Gerado com ${result.metadata.model}`
                      : 'O copy gerado aparecerá aqui'}
                  </CardDescription>
                </div>
                {result && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  {/* Headline */}
                  {result.content.headline && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Headline
                      </label>
                      <p className="text-xl font-semibold text-foreground">
                        {result.content.headline}
                      </p>
                    </div>
                  )}

                  {/* Body */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Texto Principal
                    </label>
                    <p className="text-base whitespace-pre-wrap leading-relaxed">
                      {result.content.body}
                    </p>
                  </div>

                  {/* CTA */}
                  {result.content.cta && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Call-to-Action
                      </label>
                      <p className="text-base font-medium text-amg">
                        {result.content.cta}
                      </p>
                    </div>
                  )}

                  {/* Hashtags */}
                  {result.content.hashtags.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Hashtags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {result.content.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-foreground/5 rounded text-sm text-foreground"
                          >
                            #{tag.replace('#', '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Character Count */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Caracteres</span>
                      <span className={`font-medium ${charPercentage > 100 ? 'text-red-600' : charPercentage > 80 ? 'text-amber-600' : 'text-green-600'}`}>
                        {charCount} / {charLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          charPercentage > 100 ? 'bg-red-600 w-full' :
                          charPercentage > 80 ? 'bg-amber-600' :
                          'bg-green-600'
                        }`}
                        {...(charPercentage <= 100 ? { style: { width: `${charPercentage}%` } } : {})}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Agentes utilizados: {result.metadata.agentsUsed.join(', ')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerate}
                      className="flex-1 gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Configura os parâmetros e clica em &quot;Gerar Copy&quot;<br />
                      para criar conteúdo para a Finiclasse
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Templates de Copy</DialogTitle>
            <DialogDescription>
              Escolhe um template pré-definido para começar rapidamente
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {templates.map((template) => {
              const Icon = contentTypes.find(ct => ct.id === template.contentType)?.icon || FileText;
              const PlatformIcon = platforms.find(p => p.id === template.platform)?.icon || Instagram;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => loadTemplate(template)}
                  className="p-4 border-2 rounded-lg text-left hover:border-amg transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-foreground/5 rounded-lg group-hover:bg-amg/10 transition-colors">
                      <Icon className="h-5 w-5 text-foreground group-hover:text-amg transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground group-hover:text-amg transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <PlatformIcon className="h-3 w-3" />
                          {platforms.find(p => p.id === template.platform)?.label}
                        </span>
                        {template.model && (
                          <span className="px-2 py-0.5 bg-foreground/5 rounded">
                            {template.model}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Copies</DialogTitle>
            <DialogDescription>
              Últimos {history.length} copies gerados
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum histórico ainda</p>
              </div>
            ) : (
              history.map((item) => {
                const PlatformIcon = platforms.find(p => p.id === item.platform)?.icon || Instagram;
                const isFavorite = favorites.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:border-amg/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <PlatformIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString('pt-PT')}
                          </span>
                          {item.model && (
                            <span className="text-xs px-2 py-0.5 bg-midnight/5 rounded">
                              {item.model}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-foreground line-clamp-1">
                          {item.content.headline || item.topic || 'Copy sem título'}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.content.body}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(item.id)}
                          className="gap-1"
                        >
                          <Heart
                            className={`h-4 w-4 ${isFavorite ? 'fill-amg text-amg' : ''}`}
                          />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadFromHistory(item)}
                        >
                          Carregar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview do Post</DialogTitle>
            <DialogDescription>
              Como o copy ficará na plataforma
            </DialogDescription>
          </DialogHeader>
          {result && (
            <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              {/* Mock social media preview */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-3 border-b flex items-center gap-2">
                  <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                    <span className="text-background text-xs font-bold">F</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Finiclasse Mercedes-Benz</p>
                    <p className="text-xs text-muted-foreground">Agora</p>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-midnight to-steel"></div>
                <div className="p-3 space-y-2">
                  <p className="font-semibold text-sm">{result.content.headline}</p>
                  <p className="text-sm whitespace-pre-wrap">{result.content.body}</p>
                  {result.content.cta && (
                    <p className="text-sm font-medium text-amg">{result.content.cta}</p>
                  )}
                  <p className="text-xs text-blue-600">
                    {result.content.hashtags.map(h => `#${h.replace('#', '')}`).join(' ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
