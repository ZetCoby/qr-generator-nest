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

    const qrCodeImage = this.qrService.generateQR(data);

    res.setHeader('Content-Type', 'image/png');
    res.send(qrCodeImage);
  }
}
