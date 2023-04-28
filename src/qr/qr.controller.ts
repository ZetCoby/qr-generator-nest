import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get()
  async generateQR(@Query('data') data: string, @Res() res: Response) {
    if (!data) {
      res.status(400).send('Please provide data query parameter');
      return;
    }

    const qrCodeImage = await this.qrService.generateQR(data, 512, 4, 'H', {
      square: {
        color: '#000',
      },
      border: {
        width: 5,
        color: '#fff',
      },
      background: '#fff',
      logo: {
        path: './logo.png',
        opacity: 1,
        proportion: 0.3
      },
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(qrCodeImage);
  }
}
