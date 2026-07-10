import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: 'anggota2@sekolah.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string = '';
}
