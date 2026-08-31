import { IsIn, IsOptional } from 'class-validator';

export class UploadDocumentDto {
  @IsOptional()
  @IsIn(['resume', 'essay', 'transcript', 'recommendation_letter', 'other'])
  documentType?: string;
}
