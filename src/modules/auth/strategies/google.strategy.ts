import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('oauth.GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>(
      'oauth.GOOGLE_CLIENT_SECRET',
    );
    const callbackURL = configService.get<string>('oauth.GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      super({
        clientID: 'DISABLED',
        clientSecret: 'DISABLED',
        callbackURL: 'http://disabled',
        scope: ['email', 'profile'],
      });
      return;
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string | null,
    profile: {
      id: string;
      name?: { givenName?: string; familyName?: string };
      emails?: Array<{ value?: string }>;
      photos?: Array<{ value?: string }>;
    },
    done: VerifyCallback,
  ): void {
    const { id, name, emails, photos } = profile;
    const user = {
      profile: {
        id,
        email: emails?.[0]?.value,
        firstName: name?.givenName,
        lastName: name?.familyName,
        picture: photos?.[0]?.value,
        provider: 'google',
      },
      accessToken,
      refreshToken: refreshToken ?? null,
    };
    done(null, user);
  }
}
