// eslint-disable-next-line @nx/enforce-module-boundaries
import { PrismaClient, Playstyle } from '@org/backend-prisma';
import { randomUUID } from 'node:crypto';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be defined before running Playwright poll sandbox helpers. ' +
      'Ensure your environment or .env file is loaded so the Prisma client can connect.',
  );
}

const prisma = new PrismaClient();

const DEFAULT_GAMES = ['E2E Sandbox Game'];
const DEFAULT_DESCRIPTION = 'Temporary group created for Playwright isolation.';
const DEFAULT_LOCATION = 'Playwright City';

export interface PollSandboxOptions {
  namePrefix?: string;
  members?: string[];
  isPublic?: boolean;
  recruiting?: boolean;
  playstyle?: Playstyle;
}

export interface PollSandboxContext {
  groupId: string;
  groupName: string;
  cleanup: () => Promise<void>;
}

async function resolveUserId(username: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new Error(`Unable to resolve user with username "${username}" for test sandbox.`);
  }
  return user.id;
}

export async function createPollSandbox(options: PollSandboxOptions = {}): Promise<PollSandboxContext> {
  const {
    namePrefix = 'E2E Poll Group',
    members = ['alice_dm'],
    isPublic = true,
    recruiting = true,
    playstyle = Playstyle.CASUAL,
  } = options;

  if (members.length === 0) {
    throw new Error('createPollSandbox requires at least one member username.');
  }

  const suffix = randomUUID().slice(0, 8);
  const groupName = `${namePrefix} ${suffix}`;

  const memberIds = await Promise.all(members.map(resolveUserId));
  const [creatorId, ...otherMemberIds] = memberIds;

  const group = await prisma.group.create({
    data: {
      name: groupName,
      games: DEFAULT_GAMES,
      location: DEFAULT_LOCATION,
      playstyle,
      description: DEFAULT_DESCRIPTION,
      recruiting,
      isPublic,
      creatorId,
    },
  });

  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: creatorId,
      role: 'ADMIN',
    },
  });

  if (otherMemberIds.length > 0) {
    await prisma.groupMember.createMany({
      data: otherMemberIds.map(userId => ({
        groupId: group.id,
        userId,
        role: 'MEMBER',
      })),
    });
  }

  const cleanup = async () => {
    await prisma.poll.deleteMany({ where: { groupId: group.id } });
    await prisma.groupMember.deleteMany({ where: { groupId: group.id } });
    try {
      await prisma.group.delete({ where: { id: group.id } });
    } catch (error) {
      const knownError = error as { code?: string };
      if (knownError?.code === 'P2025') {
        return;
      }
      throw error;
    }
  };

  return {
    groupId: group.id,
    groupName,
    cleanup,
  };
}
