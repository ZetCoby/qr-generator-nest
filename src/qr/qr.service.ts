import { Injectable } from '@nestjs/common';
import * as qr from 'qrcode-generator';
import { createCanvas, loadImage, CanvasRenderingContext2D, Canvas } from 'canvas';

type DecimalRange = 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 | 1.5 | 1.6 | 1.7 | 1.8 | 1.9 | 2.0;

interface QROptions {
  shapeStyle?: 'square' | 'dot' | 'rounded';
  positionMarkerShape?: 'square' | 'dot' | 'rounded';
  color?: string;
  border?: {
    width: number;
    color: string;
  } | null;
  background?: string | null;
  logo?: {
    path: string;
    maxSize?: number | null;
    opacity?: DecimalRange | null;
    proportion?: DecimalRange | null;
  } | null;
  gradient?: {
    type: 'linear' | 'area';
    startColor: string;
    endColor: string;
    angleDegrees?: number;
  } | null;
}


@Injectable()
export class QrService {
  generateQRMatrix(data: string, typeNumber: TypeNumber = 4, errorCorrectionLevel: ErrorCorrectionLevel = 'L'): number[][] {
    const qrcode = qr(typeNumber, errorCorrectionLevel);

    qrcode.addData(data);
    qrcode.make();

    const size = qrcode.getModuleCount();
    const matrix = [];

    for (let row = 0; row < size; row++) {
      const rowData = [];
      for (let col = 0; col < size; col++) {
        rowData.push(qrcode.isDark(row, col) ? 1 : 0);
      }
      matrix.push(rowData);
    }

    return matrix;
  }

  async generateQR(data: string, size: number = 256, typeNumber: TypeNumber = 4, errorCorrectionLevel: ErrorCorrectionLevel = 'L', options: QROptions): Promise<Buffer> {
    const matrix = this.generateQRMatrix(data, typeNumber, errorCorrectionLevel);
    const pngBuffer = await this.renderQRCodePng(matrix, size, options);
    return pngBuffer;
  }


  private async renderQRCodePng(matrix: number[][], size: number, options: QROptions): Promise<Buffer> {
    const blockSize: number = Math.round(size / matrix.length);
    const qrSize: number = blockSize * matrix.length;
    const borderWidth: number = options.border ? (options.border.width || 1) : 0;
    const canvasSize: number = qrSize + 2 * borderWidth;
    const canvas: Canvas = createCanvas(canvasSize, canvasSize);
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    this.drawBackgroundColor(ctx, options, canvasSize)
    this.drawQRCodeBorder(ctx, options, borderWidth, qrSize)
    const gradient = options.gradient
      ? this.createQRCodeGradient(ctx, qrSize, options.gradient)
      : undefined;

    this.drawShapes(ctx, matrix, options, blockSize, borderWidth, gradient);

    // Draw logo in the middle
    if (options.logo) {
      const logo = await loadImage(options.logo.path);

      // Calculate the logo size as a proportion of the QR code size
      const logoProportion = options.logo.proportion; // Adjust this value to change the logo size proportion
      const logoSize = Math.min(qrSize * logoProportion, options.logo.maxSize || Number.MAX_VALUE);

      const logoX = (canvasSize - logoSize) / 2;
      const logoY = (canvasSize - logoSize) / 2;

      // Set the opacity of the logo
      ctx.globalAlpha = options.logo.opacity !== undefined ? options.logo.opacity : 1;

      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

      // Reset the opacity for other drawings
      ctx.globalAlpha = 1;
    }

    const buffer = canvas.toBuffer('image/png');
    return buffer;
  }

  private drawSquaresCode(
    ctx: CanvasRenderingContext2D,
    matrix: number[][],
    options: QROptions,
    blockSize: number,
    borderWidth: number,
    filter: (row: number, col: number) => boolean,
    gradient?: CanvasGradient
  ): void {
    // Draw QR code squares
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && filter(row, col)) {
          ctx.fillStyle = options.color ? options.color : gradient;

          ctx.fillRect((col * blockSize) + borderWidth, (row * blockSize) + borderWidth, blockSize, blockSize);
        }
      }
    }
  }

  private drawDotsCode(
    ctx: CanvasRenderingContext2D,
    matrix: number[][],
    options: QROptions,
    blockSize: number,
    borderWidth: number,
    filter: (row: number, col: number) => boolean,
    gradient?: CanvasGradient
  ): void {
    // Draw QR code dots
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && filter(row, col)) {
          ctx.fillStyle = options.color ? options.color : gradient;

          ctx.beginPath();
          ctx.arc(
            (col * blockSize) + borderWidth + blockSize / 2,
            (row * blockSize) + borderWidth + blockSize / 2,
            blockSize / 2,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      }
    }
  }


  private drawQRCodeRounded(
    ctx: CanvasRenderingContext2D,
    matrix: number[][],
    options: QROptions,
    blockSize: number,
    borderWidth: number,
    filter: (row: number, col: number) => boolean,
    gradient?: CanvasGradient
  ): void {

    // Draw QR code rounded
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && filter(row, col)) {
          ctx.fillStyle = options.color ? options.color : gradient;


          const radius = blockSize / 2;
          const xPos = (col * blockSize) + borderWidth;
          const yPos = (row * blockSize) + borderWidth;

          const isLeftConnected = col > 0 && matrix[row][col - 1];
          const isRightConnected = col < matrix[row].length - 1 && matrix[row][col + 1];
          const isTopConnected = row > 0 && matrix[row - 1][col];
          const isBottomConnected = row < matrix.length - 1 && matrix[row + 1][col];

          // Set corner radii based on connected neighbors
          const cornerRadii = {
            topLeft: isLeftConnected || isTopConnected ? 0 : radius,
            topRight: isRightConnected || isTopConnected ? 0 : radius,
            bottomLeft: isLeftConnected || isBottomConnected ? 0 : radius,
            bottomRight: isRightConnected || isBottomConnected ? 0 : radius,
          };

          // Draw rounded rectangle
          this.drawRoundedRect(ctx, xPos, yPos, blockSize, blockSize, cornerRadii);
          ctx.fill();
        }
      }
    }
  }

  private drawBackgroundColor(
    ctx: CanvasRenderingContext2D,
    options: { background?: string },
    canvasSize: number
  ): void {
    // Draw background color
    ctx.fillStyle = options.background || 'white';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }

  private drawQRCodeBorder(
    ctx: CanvasRenderingContext2D,
    options: QROptions,
    borderWidth: number,
    qrSize: number
  ): void {
    // Draw QR code border
    if (options.border) {
      ctx.strokeStyle = options.border.color || 'white';
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(
        borderWidth / 2,
        borderWidth / 2,
        qrSize + borderWidth,
        qrSize + borderWidth
      );
    }
  }

  // Helper function to draw rectangles with inset rounded inner corners
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radii: {
      topLeft: number;
      topRight: number;
      bottomLeft: number;
      bottomRight: number;
    }
  ): void {
    ctx.beginPath();

    // Draw top side
    ctx.moveTo(x + radii.topLeft, y);
    ctx.lineTo(x + width - radii.topRight, y);
    ctx.arc(x + width - radii.topRight, y + radii.topRight, radii.topRight, -Math.PI / 2, 0);

    // Draw right side
    ctx.lineTo(x + width, y + height - radii.bottomRight);
    ctx.arc(x + width - radii.bottomRight, y + height - radii.bottomRight, radii.bottomRight, 0, Math.PI / 2);

    // Draw bottom side
    ctx.lineTo(x + radii.bottomLeft, y + height);
    ctx.arc(x + radii.bottomLeft, y + height - radii.bottomLeft, radii.bottomLeft, Math.PI / 2, Math.PI);

    // Draw left side
    ctx.lineTo(x, y + radii.topLeft);
    ctx.arc(x + radii.topLeft, y + radii.topLeft, radii.topLeft, Math.PI, 1.5 * Math.PI);

    ctx.closePath();
  }

  private createQRCodeGradient(
    ctx: CanvasRenderingContext2D,
    qrSize: number,
    gradientOptions: QROptions['gradient']
  ): CanvasGradient {
    if (gradientOptions.type === 'area') {
      const centerX = qrSize / 2;
      const centerY = qrSize / 2;
      const radius = Math.sqrt(Math.pow(qrSize / 2, 2) * 2);
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, gradientOptions.startColor);
      gradient.addColorStop(1, gradientOptions.endColor);
      return gradient;
    } else {
      const angleDegrees = gradientOptions.angleDegrees ?? 0;
      const angleRadians = (angleDegrees * Math.PI) / 180;
      const startX = qrSize / 2 * (1 - Math.cos(angleRadians));
      const startY = qrSize / 2 * (1 - Math.sin(angleRadians));
      const endX = qrSize / 2 * (1 + Math.cos(angleRadians));
      const endY = qrSize / 2 * (1 + Math.sin(angleRadians));

      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, gradientOptions.startColor);
      gradient.addColorStop(1, gradientOptions.endColor);
      return gradient;
    }
  }


  private drawShapes(
    ctx: CanvasRenderingContext2D,
    matrix: number[][],
    options: QROptions,
    blockSize: number,
    borderWidth: number,
    gradient?: CanvasGradient
  ): void {
    const positionMarkerSize = 7;

    // Draw the main QR code
    this.drawQRCodeWithStyle(ctx, matrix, options, blockSize, borderWidth, options.shapeStyle, (row, col) => {
      const isPositionMarker = (row < positionMarkerSize || row >= matrix.length - positionMarkerSize) && (col < positionMarkerSize || col >= matrix[row].length - positionMarkerSize);
      return !this.isPositionMarker(row, col, matrix.length);;
    }, gradient);

    // Draw the position markers
    if (options.positionMarkerShape) {
      this.drawQRCodeWithStyle(ctx, matrix, options, blockSize, borderWidth, options.positionMarkerShape, (row, col) => {
        const isPositionMarker = (row < positionMarkerSize || row >= matrix.length - positionMarkerSize) && (col < positionMarkerSize || col >= matrix[row].length - positionMarkerSize);
        return this.isPositionMarker(row, col, matrix.length);

      }, gradient);
    }
  }

  private drawQRCodeWithStyle(
    ctx: CanvasRenderingContext2D,
    matrix: number[][],
    options: QROptions,
    blockSize: number,
    borderWidth: number,
    shapeStyle: 'square' | 'dot' | 'rounded',
    filter: (row: number, col: number) => boolean,
    gradient?: CanvasGradient,

  ): void {
    let drawFunction: (
      ctx: CanvasRenderingContext2D,
      matrix: number[][],
      options: QROptions,
      blockSize: number,
      borderWidth: number,
      filter: (row: number, col: number) => boolean
    ) => void;

    if (shapeStyle === 'dot') {
      drawFunction = this.drawDotsCode;
    } else if (shapeStyle === 'rounded') {
      drawFunction = this.drawQRCodeRounded;
    } else {
      drawFunction = this.drawSquaresCode;
    }

    drawFunction.call(this, ctx, matrix, options, blockSize, borderWidth, filter, gradient);
  }

  private isPositionMarker(row: number, col: number, size: number, positionMarkerSize: number = 7): boolean {
    const rowIsPositionMarker = row >= 0 && row <= positionMarkerSize || row >= size - positionMarkerSize;
    const colIsPositionMarker = col >= 0 && col <= positionMarkerSize || col >= size - positionMarkerSize;
    const excludeBottomRight = row >= size - positionMarkerSize && col >= size - positionMarkerSize;
    return (rowIsPositionMarker && colIsPositionMarker) && !excludeBottomRight;
  }
}
