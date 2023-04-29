import { Controller, Res, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { QrService } from './qr.service';


@Controller('qr')
export class QrController {

  constructor(private readonly qrService: QrService) {}

  @Post()
  async generateQRPost(@Body() body: any, @Res() res: Response) {
    let { data, size = 256, typeNumber = 1, errorCorrectionLevel = 'H', options } = body;
    size > 1000 ? size = 1000 : size;
    typeNumber > 40 ? typeNumber = 40 : typeNumber;

    if (!data) {
      res.status(400).send('Please provide data in the request body');
      return;
    }

    try {
      
      const qrCodeImage = await this.qrService.generateQR(
        data,
        size,
        typeNumber,
        errorCorrectionLevel,
        options
      );
        res.setHeader('Content-Type', 'image/png');
      res.send(qrCodeImage);
    } catch (error) {
      res.status(500).send(error);
    }

    
  }
}
