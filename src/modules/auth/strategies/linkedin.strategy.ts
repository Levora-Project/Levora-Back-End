import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('oauth.LINKEDIN_CLIENT_ID');
    const clientSecret = configService.get<string>(
      'oauth.LINKEDIN_CLIENT_SECRET',
    );
    const callbackURL = configService.get<string>(
      'oauth.LINKEDIN_CALLBACK_URL',
    );

    if (!clientID || !clientSecret || !callbackURL) {
      super({
        clientID: 'DISABLED',
        clientSecret: 'DISABLED',
        callbackURL: 'http://disabled',
        scope: ['r_emailaddress', 'r_liteprofile'],
      });
      return;
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['r_emailaddress', 'r_liteprofile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string | null,
    profile: Profile,
    done: (err: unknown, user: unknown, info?: unknown) => void,
  ): void {
    const { id, name, emails, photos } = profile as {
      id: string;
      name?: { givenName?: string; familyName?: string };
      emails?: Array<{ value?: string }>;
      photos?: Array<{ value?: string }>;
    };
    const user = {
      profile: {
        id,
        email: emails?.[0]?.value,
        firstName: name?.givenName,
        lastName: name?.familyName,
        picture: photos?.[0]?.value,
        provider: 'linkedin',
      },
      accessToken,
      refreshToken: refreshToken ?? null,
    };
    done(null, user);
  }
}
