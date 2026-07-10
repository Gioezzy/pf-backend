// registrations/applications/dto/upload-proof.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadProofDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File bukti pembayaran (JPG/PNG)',
  })
  file: Express.Multer.File = undefined as unknown as Express.Multer.File;
}
