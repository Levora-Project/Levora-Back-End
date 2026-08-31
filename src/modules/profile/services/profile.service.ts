import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import {
  normalizeGPA,
  validateGPARange,
} from '../../../common/utils/gpa-normalizer';

export interface ProfileWithRelations {
  educationLevel?: string | null;
  fieldOfStudy?: string[] | null;
  nationality?: string | null;
  dateOfBirth?: Date | null;
  currentCountry?: string | null;
  currentCity?: string | null;
  phone?: string | null;
  experienceLevel?: string | null;
  hasFinancialNeed?: boolean | null;
  careerGoals?: string | null;
  profilePhotoUrl?: string | null;
  user?: {
    userSkills?: unknown[];
    userLanguages?: unknown[];
    documents?: unknown[];
  } | null;
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    let profile = await this.prisma.userProfiles.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            userEducations: true,
            userSkills: {
              include: {
                skill: true,
              },
            },
            userLanguages: {
              include: {
                language: true,
              },
            },
            documents: true,
          },
        },
      },
    });

    if (!profile) {
      profile = await this.prisma.userProfiles.create({
        data: {
          userId,
          isDraft: true,
        },
        include: {
          user: {
            select: {
              userEducations: true,
              userSkills: {
                include: { skill: true },
              },
              userLanguages: {
                include: { language: true },
              },
              documents: true,
            },
          },
        },
      });
    }

    return profile;
  }

  isCoreFieldsComplete(profile: ProfileWithRelations): boolean {
    return (
      profile.educationLevel !== null &&
      profile.educationLevel !== undefined &&
      Array.isArray(profile.fieldOfStudy) &&
      profile.fieldOfStudy.length > 0 &&
      profile.nationality !== null &&
      profile.nationality !== undefined
    );
  }

  calculateCompletionPct(profile: ProfileWithRelations): number {
    let pct = 0;
    if (profile.educationLevel) {
      pct += 15;
    }
    if (profile.fieldOfStudy && profile.fieldOfStudy.length > 0) {
      pct += 15;
    }
    if (profile.nationality) {
      pct += 15;
    }
    if (profile.dateOfBirth) {
      pct += 5;
    }
    if (profile.currentCountry) {
      pct += 5;
    }
    if (profile.currentCity) {
      pct += 5;
    }
    if (profile.phone) {
      pct += 5;
    }
    if (profile.experienceLevel) {
      pct += 5;
    }
    if (
      profile.hasFinancialNeed !== null &&
      profile.hasFinancialNeed !== undefined
    ) {
      pct += 5;
    }
    if (profile.careerGoals && profile.careerGoals.length > 20) {
      pct += 5;
    }
    if (profile.user?.userSkills && profile.user.userSkills.length > 0) {
      pct += 10;
    }
    if (profile.user?.userLanguages && profile.user.userLanguages.length > 0) {
      pct += 5;
    }
    if (profile.profilePhotoUrl) {
      pct += 5;
    }
    return pct;
  }

  calculateLastCompletedStep(profile: ProfileWithRelations): number {
    let step = 0;

    // Step 1: Education
    if (
      profile.educationLevel &&
      profile.fieldOfStudy?.length > 0 &&
      profile.nationality
    ) {
      step = 1;
    } else if (profile.educationLevel && profile.nationality) {
      return 1; // Partial step 1
    }

    // Step 2: Background
    if (
      step === 1 &&
      (profile.experienceLevel ||
        (profile.hasFinancialNeed !== null &&
          profile.hasFinancialNeed !== undefined) ||
        profile.careerGoals)
    ) {
      step = 2;
    }

    // Step 3: Skills & Languages
    if (
      step === 2 &&
      profile.user?.userSkills?.length > 0 &&
      profile.user?.userLanguages?.length > 0
    ) {
      step = 3;
    }

    // Step 4: Documents
    if (step === 3 && profile.user?.documents?.length > 0) {
      step = 4;
    }

    return step || (profile.nationality ? 1 : 0);
  }

  async getProfileWithDetails(userId: string) {
    const profile = await this.getProfile(userId);

    const educations = profile.user.userEducations;
    const skills = profile.user.userSkills.map(
      (us: {
        skillId: string;
        skill: { name: string };
        proficiency: string;
      }) => ({
        skillId: us.skillId,
        name: us.skill.name,
        proficiency: us.proficiency,
      }),
    );
    const languages = profile.user.userLanguages.map(
      (ul: {
        languageId: string;
        language: { name: string };
        proficiency: string;
      }) => ({
        languageId: ul.languageId,
        name: ul.language.name,
        proficiency: ul.proficiency,
      }),
    );
    const documents = profile.user.documents;

    const gpaNormalized4 =
      educations.length > 0 ? Number(educations[0].gpaNormalized4) : null;

    return {
      userId: profile.userId,
      fullName: profile.fullName,
      dateOfBirth: profile.dateOfBirth,
      nationality: profile.nationality,
      educationLevel: profile.educationLevel,
      fieldOfStudy: profile.fieldOfStudy,
      currentCountry: profile.currentCountry,
      currentCity: profile.currentCity,
      phone: profile.phone,
      experienceLevel: profile.experienceLevel,
      hasFinancialNeed: profile.hasFinancialNeed,
      careerGoals: profile.careerGoals,
      profilePhotoUrl: profile.profilePhotoUrl,
      completionPct: this.calculateCompletionPct(profile),
      coreFieldsComplete: this.isCoreFieldsComplete(profile),
      lastCompletedStep: this.calculateLastCompletedStep(profile),
      gpaNormalized4:
        gpaNormalized4 === null || isNaN(gpaNormalized4)
          ? null
          : gpaNormalized4,
      isDraft: profile.isDraft,
      educations,
      skills,
      languages,
      documents,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const currentProfile = await this.prisma.userProfiles.findUnique({
      where: { userId },
    });

    if (!currentProfile) {
      throw new NotFoundException('Profile not found');
    }

    if (currentProfile.educationLevel && data.educationLevel === null) {
      throw new BadRequestException(
        'Cannot clear required field educationLevel',
      );
    }
    if (currentProfile.nationality && data.nationality === null) {
      throw new BadRequestException('Cannot clear required field nationality');
    }
    if (
      currentProfile.fieldOfStudy?.length > 0 &&
      data.fieldOfStudy &&
      data.fieldOfStudy.length === 0
    ) {
      throw new BadRequestException('Cannot clear required field fieldOfStudy');
    }

    await this.prisma.$transaction(async (prisma) => {
      const { skills, languages, gpaValue, gpaScale, ...profileData } = data;

      await prisma.userProfiles.update({
        where: { userId },
        data: profileData,
      });

      if (skills) {
        if (skills.length > 20) {
          throw new BadRequestException('Maximum 20 skills allowed');
        }
        await prisma.userSkills.deleteMany({ where: { userId } });
        for (const skill of skills) {
          const exists = await prisma.skillsMaster.findUnique({
            where: { id: skill.skillId },
          });
          if (!exists) {
            throw new BadRequestException(`Skill ${skill.skillId} not found`);
          }

          await prisma.userSkills.create({
            data: {
              userId,
              skillId: skill.skillId,
              proficiency: skill.proficiency,
            },
          });
        }
      }

      if (languages) {
        if (languages.length > 5) {
          throw new BadRequestException('Maximum 5 languages allowed');
        }
        await prisma.userLanguages.deleteMany({ where: { userId } });
        for (const lang of languages) {
          const exists = await prisma.languagesMaster.findUnique({
            where: { id: lang.languageId },
          });
          if (!exists) {
            throw new BadRequestException(
              `Language ${lang.languageId} not found`,
            );
          }

          await prisma.userLanguages.create({
            data: {
              userId,
              languageId: lang.languageId,
              proficiency: lang.proficiency,
            },
          });
        }
      }

      if (gpaValue !== undefined && gpaScale) {
        if (!validateGPARange(gpaValue, gpaScale)) {
          throw new BadRequestException('Invalid GPA range for selected scale');
        }
        const normalized = normalizeGPA(gpaValue, gpaScale);

        const educations = await prisma.userEducations.findMany({
          where: { userId },
        });
        if (educations.length > 0) {
          const ed = educations[0];
          await prisma.userEducations.update({
            where: { id: ed.id },
            data: {
              gpaRaw: typeof gpaValue === 'number' ? gpaValue : null,
              gpaRawScale:
                gpaScale === '4.0'
                  ? 4.0
                  : gpaScale === 'percentage'
                    ? 100
                    : null,
              gpaNormalized4: normalized,
            },
          });
        } else {
          await prisma.userEducations.create({
            data: {
              userId,
              degree: 'Unknown',
              major: 'Unknown',
              institution: 'Unknown',
              gpaRaw: typeof gpaValue === 'number' ? gpaValue : null,
              gpaRawScale:
                gpaScale === '4.0'
                  ? 4.0
                  : gpaScale === 'percentage'
                    ? 100
                    : null,
              gpaNormalized4: normalized,
            },
          });
        }
      } else if (gpaScale && gpaValue === undefined) {
        const educations = await prisma.userEducations.findMany({
          where: { userId },
        });
        if (educations.length > 0) {
          await prisma.userEducations.update({
            where: { id: educations[0].id },
            data: {
              gpaRaw: null,
              gpaRawScale:
                gpaScale === '4.0'
                  ? 4.0
                  : gpaScale === 'percentage'
                    ? 100
                    : null,
              gpaNormalized4: null,
            },
          });
        }
      }

      const updatedProfileWithRelations = await prisma.userProfiles.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              userSkills: true,
              userLanguages: true,
              documents: true,
            },
          },
        },
      });

      const pct = this.calculateCompletionPct(updatedProfileWithRelations);
      const isCore = this.isCoreFieldsComplete(updatedProfileWithRelations);

      await prisma.userProfiles.update({
        where: { userId },
        data: {
          completionPct: pct,
          isDraft: !isCore,
        },
      });
    });

    return this.getProfileWithDetails(userId);
  }
}
