'use client'

import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { Template, BRAND_COLORS } from '../templates'

interface CanvasPreviewProps {
  template: Template
  backgroundImage: string | null
  textValues: Record<string, string>
  scale?: number
  className?: string
}

export interface CanvasPreviewHandle {
  exportImage: (format?: 'png' | 'jpeg', quality?: number) => string | null
  getCanvas: () => HTMLCanvasElement | null
}

export const CanvasPreview = forwardRef<CanvasPreviewHandle, CanvasPreviewProps>(
  function CanvasPreview(
    { template, backgroundImage, textValues, scale = 0.4, className = '' },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({})
    const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
    const [fontsLoaded, setFontsLoaded] = useState(false)

    // Wait for fonts to load
    useEffect(() => {
      document.fonts.ready.then(() => {
        setFontsLoaded(true)
      })
    }, [])

    // Preload logos and images
    useEffect(() => {
      const imagesToLoad: string[] = []

      template.fixedElements.forEach(el => {
        if (el.type === 'logo' && el.src) {
          imagesToLoad.push(el.src)
        }
      })

      if (imagesToLoad.length === 0) {
        setLoadedImages({})
        return
      }

      const loaded: Record<string, HTMLImageElement> = {}
      let loadedCount = 0

      imagesToLoad.forEach(src => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          loaded[src] = img
          loadedCount++
          if (loadedCount === imagesToLoad.length) {
            setLoadedImages({ ...loaded })
          }
        }
        img.onerror = () => {
          console.error('Failed to load image:', src)
          loadedCount++
          if (loadedCount === imagesToLoad.length) {
            setLoadedImages({ ...loaded })
          }
        }
        img.src = src
      })
    }, [template])

    // Load background image
    useEffect(() => {
      if (!backgroundImage) {
        setBgImage(null)
        return
      }

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setBgImage(img)
      }
      img.onerror = () => {
        console.error('Failed to load background image')
        setBgImage(null)
      }
      img.src = backgroundImage
    }, [backgroundImage])

    // Draw canvas
    const drawCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { width, height, photoArea, textFields, fixedElements } = template

      // Clear canvas with dark background
      ctx.fillStyle = BRAND_COLORS.darkGray
      ctx.fillRect(0, 0, width, height)

      // 1. Draw background photo if available
      if (bgImage && photoArea) {
        // Calculate cover fit
        const imgRatio = bgImage.width / bgImage.height
        const areaRatio = photoArea.width / photoArea.height

        let drawWidth, drawHeight, drawX, drawY

        if (imgRatio > areaRatio) {
          // Image is wider - fit by height
          drawHeight = photoArea.height
          drawWidth = drawHeight * imgRatio
          drawX = photoArea.x - (drawWidth - photoArea.width) / 2
          drawY = photoArea.y
        } else {
          // Image is taller - fit by width
          drawWidth = photoArea.width
          drawHeight = drawWidth / imgRatio
          drawX = photoArea.x
          drawY = photoArea.y - (drawHeight - photoArea.height) / 2
        }

        // Clip to photo area with rounded corners
        ctx.save()
        if (photoArea.borderRadius && photoArea.borderRadius > 0) {
          ctx.beginPath()
          ctx.roundRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height, photoArea.borderRadius)
          ctx.clip()
        } else {
          ctx.beginPath()
          ctx.rect(photoArea.x, photoArea.y, photoArea.width, photoArea.height)
          ctx.clip()
        }

        // Draw image
        ctx.drawImage(bgImage, drawX, drawY, drawWidth, drawHeight)

        // Draw dark overlay for text readability
        if (photoArea.overlayOpacity > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${photoArea.overlayOpacity})`
          ctx.fillRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height)
        }

        ctx.restore()
      } else if (photoArea) {
        // Draw placeholder area
        ctx.save()
        if (photoArea.borderRadius && photoArea.borderRadius > 0) {
          ctx.beginPath()
          ctx.roundRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height, photoArea.borderRadius)
          ctx.clip()
        }
        ctx.fillStyle = '#2a2a2a'
        ctx.fillRect(photoArea.x, photoArea.y, photoArea.width, photoArea.height)

        // Draw placeholder text
        ctx.fillStyle = '#555'
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Adicione uma foto', photoArea.x + photoArea.width / 2, photoArea.y + photoArea.height / 2)
        ctx.restore()
      }

      // 2. Draw text fields
      textFields.forEach(field => {
        const text = textValues[field.id] !== undefined ? textValues[field.id] : field.defaultValue
        if (!text) return

        const fontWeight = field.fontWeight === 300 ? '300' : '400'
        ctx.font = `${fontWeight} ${field.fontSize}px ${field.fontFamily}`
        ctx.fillStyle = field.color
        ctx.textAlign = field.align
        ctx.textBaseline = 'top'

        // Handle multi-line text (split by \n)
        const lines = text.split('\n')
        const lineHeight = field.fontSize * (field.lineHeight || 1.2)

        lines.forEach((line, i) => {
          // Word wrap if needed
          const words = line.split(' ')
          const wrappedLines: string[] = []
          let currentLine = ''

          words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word
            const metrics = ctx.measureText(testLine)

            if (metrics.width > field.maxWidth && currentLine) {
              wrappedLines.push(currentLine)
              currentLine = word
            } else {
              currentLine = testLine
            }
          })
          if (currentLine) {
            wrappedLines.push(currentLine)
          }

          // Draw each wrapped line
          wrappedLines.forEach((wrappedLine, j) => {
            const yPos = field.y + (i * lineHeight * lines.length) + (j * lineHeight)
            ctx.fillText(wrappedLine, field.x, yPos)
          })
        })
      })

      // 3. Draw fixed elements (logos and badges)
      fixedElements.forEach(el => {
        if (el.type === 'logo' && el.src && loadedImages[el.src]) {
          const img = loadedImages[el.src]
          ctx.globalAlpha = el.opacity ?? 1
          ctx.drawImage(img, el.x, el.y, el.width, el.height)
          ctx.globalAlpha = 1
        } else if (el.type === 'badge' && el.text) {
          // Draw badge background
          ctx.fillStyle = el.backgroundColor || BRAND_COLORS.petronas
          if (el.borderRadius && el.borderRadius > 0) {
            ctx.beginPath()
            ctx.roundRect(el.x, el.y, el.width, el.height, el.borderRadius)
            ctx.fill()
          } else {
            ctx.fillRect(el.x, el.y, el.width, el.height)
          }

          // Draw badge text
          ctx.fillStyle = el.textColor || BRAND_COLORS.white
          ctx.font = `400 ${el.fontSize || 16}px ${el.fontFamily || 'Arial'}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(el.text, el.x + el.width / 2, el.y + el.height / 2)
        }
      })
    }, [template, bgImage, textValues, loadedImages])

    // Redraw when dependencies change
    useEffect(() => {
      if (fontsLoaded) {
        drawCanvas()
      }
    }, [drawCanvas, fontsLoaded])

    // Export function
    const exportImage = useCallback((format: 'png' | 'jpeg' = 'png', quality = 0.92): string | null => {
      const canvas = canvasRef.current
      if (!canvas) return null

      // Redraw at full resolution before export
      drawCanvas()

      if (format === 'jpeg') {
        return canvas.toDataURL('image/jpeg', quality)
      }
      return canvas.toDataURL('image/png')
    }, [drawCanvas])

    const getCanvas = useCallback(() => {
      return canvasRef.current
    }, [])

    // Expose functions via ref
    useImperativeHandle(ref, () => ({
      exportImage,
      getCanvas,
    }), [exportImage, getCanvas])

    const displayWidth = template.width * scale
    const displayHeight = template.height * scale

    return (
      <div
        className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
        style={{
          width: displayWidth,
          height: displayHeight,
        }}
      >
        <canvas
          ref={canvasRef}
          width={template.width}
          height={template.height}
          style={{
            width: displayWidth,
            height: displayHeight,
          }}
        />
      </div>
    )
  }
)
