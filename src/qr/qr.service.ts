import { Injectable } from '@nestjs/common';
import * as qr from 'qrcode-generator';
import { createCanvas, loadImage } from 'canvas';

interface QROptions {
  square: {
    color: string;
  };
  border?: {
    width: number;
    color: string;
  };
  background?: string;
  logo?: {
    path: string;
    maxSize?: number;
  };
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
    const blockSize = Math.round(size / matrix.length);
    const qrSize = blockSize * matrix.length;
    const borderWidth = options.border ? (options.border.width || 1) : 0;
    const canvasSize = qrSize + 2 * borderWidth;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');

    // Draw background color
    ctx.fillStyle = options.background || 'white';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw QR code border
    if (options.border) {
      ctx.strokeStyle = options.border.color || 'white';
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, qrSize + borderWidth, qrSize + borderWidth);
    }


    // for (let row = 0; row < matrix.length; row++) {
    //   for (let col = 0; col < matrix[row].length; col++) {
    //     if (matrix[row][col]) {
    //       // Customize the style of each dot here
    //       ctx.fillStyle = 'black'; // Set the color of the dot
    //       ctx.beginPath();
    //       ctx.arc(col * blockSize + blockSize / 2, row * blockSize + blockSize / 2, blockSize / 2, 0, 2 * Math.PI);
    //       ctx.fill();
    //     }
    //   }
    // }

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          ctx.fillStyle = options.square.color || 'black'; // Set the color of the square
          ctx.fillRect((col * blockSize) + borderWidth, (row * blockSize) + borderWidth, blockSize, blockSize);
        }
      }
    }

    // Draw logo in the middle
    if (options.logo) {
      const logo = await loadImage(options.logo.path);
      const logoSize = Math.min(canvasSize / 3, options.logo.maxSize || Number.MAX_VALUE);
      const logoX = (canvasSize - logoSize) / 2;
      const logoY = (canvasSize - logoSize) / 2;
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    }

    const buffer = canvas.toBuffer('image/png');
    return buffer;
  }
}
