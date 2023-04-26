import { Injectable } from '@nestjs/common';
import * as qr from 'qrcode-generator';
import { createCanvas } from 'canvas';

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

  generateQR(data: string, size: number = 256, typeNumber: TypeNumber = 4, errorCorrectionLevel:ErrorCorrectionLevel = 'L'): Buffer {
    const matrix = this.generateQRMatrix(data, typeNumber, errorCorrectionLevel);
    const pngBuffer = this.renderQRCodePng(matrix, size);
    return pngBuffer;
  }

  private renderQRCodePng(matrix: number[][], size: number): Buffer {
    const blockSize = Math.round(size / matrix.length);
    const qrSize = blockSize * matrix.length;
    const canvas = createCanvas(qrSize, qrSize);
    const ctx = canvas.getContext('2d');

    // Draw QR code dots
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          // Customize the style of each dot here
          ctx.fillStyle = 'black'; // Set the color of the dot
          ctx.beginPath();
          ctx.arc(col * blockSize + blockSize / 2, row * blockSize + blockSize / 2, blockSize / 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    const buffer = canvas.toBuffer('image/png');
    return buffer;
  }
}
