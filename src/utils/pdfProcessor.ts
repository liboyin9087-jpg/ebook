import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface PDFPageImage {
  pageNumber: number
  imageBlob: Blob
  width: number
  height: number
}

export class PDFProcessor {
  private static readonly IMAGE_SCALE = 2 // Higher scale for better quality
  private static readonly IMAGE_QUALITY = 0.92 // JPEG quality (0-1)

  /**
   * Convert a PDF file to an array of image blobs
   */
  static async convertPDFToImages(
    file: File,
    onProgress?: (current: number, total: number) => void
  ): Promise<PDFPageImage[]> {
    try {
      // Load the PDF document
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      const totalPages = pdf.numPages
      const images: PDFPageImage[] = []

      // Process each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: this.IMAGE_SCALE })

        // Create canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
          throw new Error('Failed to get canvas context')
        }

        canvas.width = viewport.width
        canvas.height = viewport.height

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to convert canvas to blob'))
              }
            },
            'image/jpeg',
            this.IMAGE_QUALITY
          )
        })

        images.push({
          pageNumber: pageNum,
          imageBlob: blob,
          width: viewport.width,
          height: viewport.height,
        })

        // Call progress callback
        if (onProgress) {
          onProgress(pageNum, totalPages)
        }

        // Clean up
        page.cleanup()
      }

      return images
    } catch (error) {
      console.error('Error converting PDF to images:', error)
      throw new Error('PDF 轉換失敗,請確認檔案是否正確')
    }
  }

  /**
   * Validate if a file is a valid PDF
   */
  static async validatePDF(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      return pdf.numPages > 0
    } catch {
      return false
    }
  }

  /**
   * Get PDF metadata
   */
  static async getPDFMetadata(file: File): Promise<{
    numPages: number
    title?: string
    author?: string
  }> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const metadata = await pdf.getMetadata()

      const info = metadata.info as { Title?: string; Author?: string } | null

      return {
        numPages: pdf.numPages,
        title: info?.Title || file.name,
        author: info?.Author,
      }
    } catch (error) {
      console.error('Error getting PDF metadata:', error)
      throw new Error('無法讀取 PDF 資訊')
    }
  }
}
