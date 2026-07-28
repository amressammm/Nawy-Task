import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { NotFoundException } from '@nestjs/common';
import { detectImageType } from './image-type';
import { IMAGE_KEY_PATTERN, StorageService } from './storage.service';

/** Refused before the file is ever buffered in memory. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Post()
  @ApiOperation({
    summary: 'Upload an apartment image',
    description:
      'Accepts a JPEG, PNG, or WebP up to 5 MB and returns the key to pass as `imageKey` when creating an apartment.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @ApiCreatedResponse({ schema: { properties: { key: { type: 'string' } } } })
  @ApiBadRequestResponse({ description: 'No file, or the file is larger than 5 MB.' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  async upload(@UploadedFile() file?: Express.Multer.File): Promise<{ key: string }> {
    if (!file) {
      throw new BadRequestException('A file is required.');
    }

    const type = detectImageType(file.buffer);
    if (!type) {
      throw new UnsupportedMediaTypeException(
        'Only JPEG, PNG, and WebP images are accepted.',
      );
    }

    return { key: await this.storage.put(file.buffer, type.mime, type.extension) };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Fetch a stored image' })
  @ApiNotFoundResponse({ description: 'No stored image with that key.' })
  async download(
    @Param('key') key: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    if (!IMAGE_KEY_PATTERN.test(key)) {
      throw new NotFoundException('No such image');
    }

    const info = await this.storage.stat(key);
    if (!info) {
      throw new NotFoundException('No such image');
    }

    response.set({
      'Content-Type': info.contentType,
      'Content-Length': String(info.size),
      // Keys are unique per upload and objects are never rewritten, so these
      // can be cached indefinitely.
      'Cache-Control': 'public, max-age=31536000, immutable',
    });

    return new StreamableFile(await this.storage.get(key));
  }
}
