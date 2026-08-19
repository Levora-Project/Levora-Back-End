import { SetMetadata } from '@nestjs/common';

export const DEPRECATED_KEY = 'deprecated';

export interface DeprecatedOptions {
  sunsetDate: string;
  replacement: string;
}

export const Deprecated = (options: DeprecatedOptions) =>
  SetMetadata(DEPRECATED_KEY, options);
