declare module 'passport-apple' {
  export class Strategy {
    constructor(
      options: Record<string, unknown>,
      verify: (...args: unknown[]) => void,
    );
  }
  const AppleStrategy: typeof Strategy;
  export default AppleStrategy;
}

declare module 'passport-facebook' {
  export class Strategy {
    constructor(
      options: Record<string, unknown>,
      verify: (...args: unknown[]) => void,
    );
  }
  export interface Profile {
    id: string;
    displayName?: string;
    name?: {
      familyName?: string;
      givenName?: string;
      middleName?: string;
    };
    emails?: Array<{ value?: string }>;
    photos?: Array<{ value?: string }>;
    provider?: string;
    _raw?: string;
    _json?: unknown;
  }
}

declare module 'passport-linkedin-oauth2' {
  export class Strategy {
    constructor(
      options: Record<string, unknown>,
      verify: (...args: unknown[]) => void,
    );
  }
  export interface Profile {
    id: string;
    displayName?: string;
    name?: {
      familyName?: string;
      givenName?: string;
    };
    emails?: Array<{ value?: string }>;
    photos?: Array<{ value?: string }>;
    provider?: string;
    _raw?: string;
    _json?: unknown;
  }
}
