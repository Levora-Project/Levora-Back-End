import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DocumentsService } from '../services/documents.service';

interface RequestWithUser {
  user: { id: string };
}

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        if (
          !file.mimetype.match(
            /pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|image\/png|image\/jpeg/,
          )
        ) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') docType: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Deep validate with file-type
    const { fromBuffer } = await import('file-type');
    const typeInfo = await fromBuffer(file.buffer);

    if (
      !typeInfo ||
      !typeInfo.mime.match(
        /pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|image\/png|image\/jpeg/,
      )
    ) {
      throw new BadRequestException('Invalid file content signature');
    }

    if (typeInfo.mime !== file.mimetype) {
      // Allow docx which sometimes appears as zip
      if (
        typeInfo.mime === 'application/zip' &&
        file.mimetype ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        // Ok
      } else {
        throw new BadRequestException('File extension does not match content');
      }
    }

    const doc = await this.documentsService.uploadDocument(
      req.user.id,
      file,
      docType || 'other',
    );
    return {
      statusCode: 201,
      message: 'Document uploaded successfully',
      data: doc,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all user documents' })
  async getDocuments(@Req() req: RequestWithUser) {
    const data = await this.documentsService.getDocuments(req.user.id);
    return {
      statusCode: 200,
      message: 'Documents retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL for a document' })
  async getDownloadUrl(@Req() req: RequestWithUser, @Param('id') id: string) {
    const data = await this.documentsService.getDownloadUrl(req.user.id, id);
    return {
      statusCode: 200,
      message: 'Download URL generated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.documentsService.deleteDocument(req.user.id, id);
    return {
      statusCode: 200,
      message: 'Document deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
