'use client'

import { useState, useRef, useCallback, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  Image as ImageIcon,
  Type,
  Sparkles,
  Instagram,
  Facebook,
  Linkedin,
  X,
  FileImage,
  FileDown,
  Trash2,
} from "lucide-react"
import { TEMPLATES, Template, PLATFORM_SIZES } from './templates'
import { CanvasPreview, CanvasPreviewHandle } from './components/CanvasPreview'

// Wizard steps
type WizardStep = 'template' | 'photo' | 'text' | 'export'

const STEPS: { id: WizardStep; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'template', label: 'Template', description: 'Escolha o formato', icon: <Sparkles className="h-5 w-5" /> },
  { id: 'photo', label: 'Foto', description: 'Adicione a imagem', icon: <ImageIcon className="h-5 w-5" /> },
  { id: 'text', label: 'Texto', description: 'Personalize', icon: <Type className="h-5 w-5" /> },
  { id: 'export', label: 'Exportar', description: 'Download', icon: <Download className="h-5 w-5" /> },
]

// Platform config with colors
const PLATFORM_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  'instagram-story': { icon: <Instagram className="h-4 w-4" />, color: 'text-pink-600', bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  'instagram-post': { icon: <Instagram className="h-4 w-4" />, color: 'text-pink-600', bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  'instagram-reels': { icon: <Instagram className="h-4 w-4" />, color: 'text-pink-600', bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  'facebook': { icon: <Facebook className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-600' },
  'linkedin': { icon: <Linkedin className="h-4 w-4" />, color: 'text-blue-700', bgColor: 'bg-blue-700' },
}

export default function TemplateEditorPage() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [textValues, setTextValues] = useState<Record<string, string>>({})
  const [platformFilter, setPlatformFilter] = useState<string | null>(null)

  // Canvas ref for export
  const canvasRef = useRef<CanvasPreviewHandle>(null)

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)

  // Filter templates by platform
  const filteredTemplates = platformFilter
    ? TEMPLATES.filter(t => t.platform === platformFilter)
    : TEMPLATES

  // Handle template selection
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    const defaults: Record<string, string> = {}
    template.textFields.forEach(field => {
      defaults[field.id] = field.defaultValue
    })
    setTextValues(defaults)
  }

  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setBackgroundImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle text change
  const handleTextChange = (fieldId: string, value: string) => {
    setTextValues(prev => ({ ...prev, [fieldId]: value }))
  }

  // Navigation
  const goToStep = (step: WizardStep) => {
    setCurrentStep(step)
  }

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id)
    }
  }

  const goBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id)
    }
  }

  // Export functions
  const exportAsPNG = useCallback(() => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.exportImage('png')
    if (!dataUrl) return

    const link = document.createElement('a')
    link.download = `${selectedTemplate?.name || 'template'}-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }, [selectedTemplate])

  const exportAsJPG = useCallback(() => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.exportImage('jpeg', 0.95)
    if (!dataUrl) return

    const link = document.createElement('a')
    link.download = `${selectedTemplate?.name || 'template'}-${Date.now()}.jpg`
    link.href = dataUrl
    link.click()
  }, [selectedTemplate])

  // Check if can proceed
  const canProceed = () => {
    switch (currentStep) {
      case 'template':
        return selectedTemplate !== null
      case 'photo':
        return true
      case 'text':
        return true
      case 'export':
        return true
      default:
        return false
    }
  }

  // Reset wizard
  const resetWizard = () => {
    setCurrentStep('template')
    setSelectedTemplate(null)
    setBackgroundImage(null)
    setTextValues({})
  }

  // Render premium step indicator
  const renderStepIndicator = () => (
    <div className="bg-gradient-to-r from-midnight via-midnight to-graphite rounded-2xl p-6 mb-8 shadow-xl">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentStepIndex
          const isClickable = index <= currentStepIndex || (index === currentStepIndex + 1 && canProceed())

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => isClickable && goToStep(step.id)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isActive
                    ? 'bg-amg text-white shadow-lg shadow-amg/40 scale-110'
                    : isCompleted
                      ? 'bg-amg/30 text-amg'
                      : 'bg-graphite text-arrow'
                  }
                `}>
                  {isCompleted ? <Check className="h-6 w-6" /> : step.icon}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold ${isActive ? 'text-white' : isCompleted ? 'text-amg' : 'text-arrow'}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-arrow' : 'text-gray-500'} hidden sm:block`}>
                    {step.description}
                  </p>
                </div>
              </button>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                  index < currentStepIndex ? 'bg-amg' : 'bg-graphite'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // Render template selection step
  const renderTemplateStep = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-2">Escolha um Template</h2>
        <p className="text-muted-foreground">
          Selecione o formato ideal para a sua publicação nas redes sociais
        </p>
      </div>

      {/* Platform filters - Pill style */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setPlatformFilter(null)}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
            platformFilter === null
              ? 'bg-foreground text-background shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {Object.entries(PLATFORM_SIZES).map(([key, value]) => {
          const config = PLATFORM_CONFIG[key]
          const isActive = platformFilter === key
          return (
            <button
              key={key}
              onClick={() => setPlatformFilter(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `${config.bgColor} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {config.icon}
              <span className="hidden sm:inline">{value.label}</span>
            </button>
          )
        })}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filteredTemplates.map(template => {
          const isSelected = selectedTemplate?.id === template.id
          const config = PLATFORM_CONFIG[template.platform]
          const aspectRatio = template.width / template.height

          return (
            <div
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`group cursor-pointer transition-all duration-300 ${
                isSelected ? 'scale-[1.02]' : 'hover:scale-[1.02]'
              }`}
            >
              <div className={`
                relative rounded-2xl overflow-hidden bg-gray-900 shadow-lg transition-all duration-300
                ${isSelected
                  ? 'ring-3 ring-amg shadow-xl shadow-amg/20'
                  : 'ring-1 ring-gray-200 group-hover:ring-2 group-hover:ring-amg/50 group-hover:shadow-xl'
                }
              `}>
                {/* Preview container with proper aspect ratio */}
                <div
                  className="relative w-full overflow-hidden"
                  style={{ paddingBottom: `${Math.min(100 / aspectRatio, 150)}%` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <CanvasPreview
                      template={template}
                      backgroundImage={null}
                      textValues={{}}
                      scale={0.12}
                    />
                  </div>
                </div>

                {/* Platform badge */}
                <div className={`absolute top-3 left-3 ${config.bgColor} text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md`}>
                  {config.icon}
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-amg text-white rounded-full p-1.5 shadow-lg">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {/* Info bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-8">
                  <p className="font-semibold text-white text-sm truncate">{template.name}</p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {template.width} × {template.height}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected template action */}
      {selectedTemplate && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={goNext}
            size="lg"
            className="bg-amg hover:bg-amg/90 text-white px-8 py-6 rounded-full shadow-2xl shadow-amg/30 transition-all duration-300 hover:scale-105"
          >
            <span className="font-semibold">Continuar com {selectedTemplate.name}</span>
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )

  // Render photo upload step
  const renderPhotoStep = () => (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Preview */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
        {selectedTemplate && (
          <CanvasPreview
            ref={canvasRef}
            template={selectedTemplate}
            backgroundImage={backgroundImage}
            textValues={textValues}
            scale={Math.min(0.45, 450 / Math.max(selectedTemplate.width, selectedTemplate.height))}
            className="shadow-2xl rounded-xl"
          />
        )}
      </div>

      {/* Upload panel */}
      <div className="lg:w-96 space-y-6">
        <div className="bg-midnight text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amg/20 rounded-xl flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-amg" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Adicione uma Foto</h2>
              <p className="text-arrow text-sm">Será usada como fundo</p>
            </div>
          </div>
        </div>

        {/* Upload area */}
        <label className="block cursor-pointer">
          <div className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
            ${backgroundImage
              ? 'border-amg bg-amg/5'
              : 'border-gray-300 hover:border-amg hover:bg-amg/5'
            }
          `}>
            {backgroundImage ? (
              <div className="space-y-4">
                <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden shadow-lg ring-4 ring-amg/20">
                  <img src={backgroundImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-amg font-semibold">Foto adicionada</p>
                  <p className="text-sm text-muted-foreground">Clique para trocar</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Arraste uma foto</p>
                  <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                </div>
                <p className="text-xs text-gray-400 bg-gray-100 inline-block px-3 py-1 rounded-full">
                  PNG, JPG até 10MB
                </p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {backgroundImage && (
          <button
            onClick={() => setBackgroundImage(null)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span className="font-medium">Remover foto</span>
          </button>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Use fotos de alta qualidade do veículo para melhores resultados.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={goNext} className="flex-1 h-12 bg-amg hover:bg-amg/90 rounded-xl">
            Próximo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )

  // Render text editing step
  const renderTextStep = () => (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Preview */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
        {selectedTemplate && (
          <CanvasPreview
            ref={canvasRef}
            template={selectedTemplate}
            backgroundImage={backgroundImage}
            textValues={textValues}
            scale={Math.min(0.45, 450 / Math.max(selectedTemplate.width, selectedTemplate.height))}
            className="shadow-2xl rounded-xl"
          />
        )}
      </div>

      {/* Text editing panel */}
      <div className="lg:w-96 space-y-6">
        <div className="bg-midnight text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amg/20 rounded-xl flex items-center justify-center">
              <Type className="h-5 w-5 text-amg" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Edite o Texto</h2>
              <p className="text-arrow text-sm">Personalize as mensagens</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {selectedTemplate?.textFields.map((field, index) => (
            <div key={field.id} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="w-6 h-6 bg-amg/10 text-amg rounded-lg flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                {field.label}
              </label>
              {field.defaultValue.includes('\n') ? (
                <textarea
                  value={textValues[field.id] || ''}
                  onChange={(e) => handleTextChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amg focus:ring-2 focus:ring-amg/20 resize-none transition-all"
                />
              ) : (
                <Input
                  value={textValues[field.id] || ''}
                  onChange={(e) => handleTextChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-amg focus:ring-2 focus:ring-amg/20"
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-600">
          Os logos da Mercedes e Finiclasse são fixos e não podem ser alterados.
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={goNext} className="flex-1 h-12 bg-amg hover:bg-amg/90 rounded-xl">
            Próximo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )

  // Render export step
  const renderExportStep = () => (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Final preview */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
        {selectedTemplate && (
          <CanvasPreview
            ref={canvasRef}
            template={selectedTemplate}
            backgroundImage={backgroundImage}
            textValues={textValues}
            scale={Math.min(0.5, 500 / Math.max(selectedTemplate.width, selectedTemplate.height))}
            className="shadow-2xl rounded-xl"
          />
        )}
      </div>

      {/* Export panel */}
      <div className="lg:w-96 space-y-6">
        <div className="bg-gradient-to-br from-amg to-amg/80 text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Pronto!</h2>
              <p className="text-white/80 text-sm">O seu post está completo</p>
            </div>
          </div>
        </div>

        {/* Download buttons */}
        <div className="space-y-3">
          <button
            onClick={exportAsPNG}
            className="w-full flex items-center justify-between p-4 bg-midnight hover:bg-midnight/90 text-white rounded-xl transition-all duration-200 hover:scale-[1.02] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <FileImage className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Download PNG</p>
                <p className="text-xs text-gray-400">Alta qualidade, transparência</p>
              </div>
            </div>
            <FileDown className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={exportAsJPG}
            className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 text-foreground rounded-xl transition-all duration-200 hover:scale-[1.02] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <FileImage className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Download JPG</p>
                <p className="text-xs text-gray-500">Menor tamanho</p>
              </div>
            </div>
            <FileDown className="h-5 w-5 text-gray-400 group-hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Details card */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-foreground">Detalhes do Post</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Template</span>
              <span className="font-medium text-foreground">{selectedTemplate?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dimensões</span>
              <span className="font-medium text-foreground">{selectedTemplate?.width} × {selectedTemplate?.height}px</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plataforma</span>
              <span className="font-medium text-foreground flex items-center gap-1.5">
                {selectedTemplate && PLATFORM_CONFIG[selectedTemplate.platform]?.icon}
                {selectedTemplate && PLATFORM_SIZES[selectedTemplate.platform].label}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            variant="ghost"
            onClick={resetWizard}
            className="flex-1 h-12 rounded-xl text-amg hover:bg-amg/10"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </div>
      </div>
    </div>
  )

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'template':
        return renderTemplateStep()
      case 'photo':
        return renderPhotoStep()
      case 'text':
        return renderTextStep()
      case 'export':
        return renderExportStep()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Template Editor
          </h1>
          <p className="mt-1 text-muted-foreground">
            Crie posts profissionais para redes sociais em segundos
          </p>
        </div>
        {selectedTemplate && currentStep !== 'template' && (
          <button
            onClick={resetWizard}
            className="text-sm text-gray-500 hover:text-amg transition-colors"
          >
            Recomeçar
          </button>
        )}
      </div>

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Step content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {renderStepContent()}
      </div>
    </div>
  )
}
