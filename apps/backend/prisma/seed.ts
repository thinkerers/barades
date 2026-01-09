import { PrismaClient, SkillLevel, SessionLevel, TagColor, LocationType, Playstyle, GroupRole, ReservationStatus } from '../generated/prisma';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. Clean existing data (dev only)
  // ============================================
  console.log('🧹 Cleaning existing data...');
  await prisma.reservation.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.session.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleaned\n');

  // ============================================
  // 2. Create Users
  // ============================================
  console.log('👥 Creating users...');
  const hashedPassword = await argon2.hash('password123');

  const alice = await prisma.user.create({
    data: {
      email: 'alice@barades.com',
      username: 'alice_dm',
      passwordHash: hashedPassword,
      firstName: 'Alice',
      lastName: 'Dungeon',
      bio: 'Experienced D&D dungeon master with 10+ years of storytelling. Love creating immersive worlds!',
      avatar: 'https://i.pravatar.cc/150?img=1',
      skillLevel: SkillLevel.EXPERT,
      preferences: {
        favoriteGames: ['D&D 5e', 'Pathfinder 2e'],
        notifications: { email: true, push: true },
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@barades.com',
      username: 'bob_boardgamer',
      passwordHash: hashedPassword,
      firstName: 'Bob',
      lastName: 'Board',
      bio: 'Board game enthusiast. I organize weekly game nights at local cafés.',
      avatar: 'https://i.pravatar.cc/150?img=2',
      skillLevel: SkillLevel.INTERMEDIATE,
      preferences: {
        favoriteGames: ['Catan', 'Wingspan', 'Ticket to Ride'],
        notifications: { email: true, push: false },
      },
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: 'carol@barades.com',
      username: 'carol_newbie',
      passwordHash: hashedPassword,
      firstName: 'Carol',
      lastName: 'Newbie',
      bio: 'New to tabletop gaming but eager to learn! Looking for beginner-friendly groups.',
      avatar: 'https://i.pravatar.cc/150?img=3',
      skillLevel: SkillLevel.BEGINNER,
    },
  });

  const dave = await prisma.user.create({
    data: {
      email: 'dave@barades.com',
      username: 'dave_poker',
      passwordHash: hashedPassword,
      firstName: 'Dave',
      lastName: 'Poker',
      bio: 'Poker player looking for regular cash games in Brussels area.',
      avatar: 'https://i.pravatar.cc/150?img=4',
      skillLevel: SkillLevel.INTERMEDIATE,
      preferences: {
        favoriteGames: ['Texas Hold\'em', 'Omaha'],
      },
    },
  });

  const eve = await prisma.user.create({
    data: {
      email: 'eve@barades.com',
      username: 'eve_admin',
      passwordHash: hashedPassword,
      firstName: 'Eve',
      lastName: 'Admin',
      bio: 'Platform administrator. Organizing community events and meetups!',
      avatar: 'https://i.pravatar.cc/150?img=5',
      skillLevel: SkillLevel.EXPERT,
    },
  });

  console.log(`✅ Created ${5} users\n`);

  // ============================================
  // 3. Create Locations
  // ============================================
  console.log('📍 Creating locations...');

  const gameStoreBrussels = await prisma.location.create({
    data: {
      name: 'Brussels Game Store',
      address: 'Rue de la Montagne 52',
      city: 'Brussels',
      type: LocationType.GAME_STORE,
      rating: 4.5,
      amenities: ['WiFi', 'Gaming Tables', 'Food', 'Drinks', 'Parking'],
      capacity: 30,
      openingHours: {
        monday: '10:00-22:00',
        tuesday: '10:00-22:00',
        wednesday: '10:00-22:00',
        thursday: '10:00-22:00',
        friday: '10:00-00:00',
        saturday: '10:00-00:00',
        sunday: '12:00-20:00',
      },
      icon: 'store',
      lat: 50.8476,
      lon: 4.3572,
      website: 'https://brusselsgamestore.example.com',
    },
  });

  const cafeJoystick = await prisma.location.create({
    data: {
      name: 'Café Joystick',
      address: 'Avenue Louise 331',
      city: 'Brussels',
      type: LocationType.CAFE,
      rating: 4.2,
      amenities: ['WiFi', 'Food', 'Drinks', 'Board Games Library'],
      capacity: 20,
      openingHours: {
        monday: 'Closed',
        tuesday: '14:00-23:00',
        wednesday: '14:00-23:00',
        thursday: '14:00-23:00',
        friday: '14:00-01:00',
        saturday: '12:00-01:00',
        sunday: '12:00-22:00',
      },
      icon: 'coffee',
      lat: 50.8317,
      lon: 4.3657,
      website: 'https://cafejoystick.example.com',
    },
  });

  const onlineLocation = await prisma.location.create({
    data: {
      name: 'Online (Discord/Roll20)',
      city: 'Online',
      type: LocationType.PRIVATE,
      rating: 5.0,
      amenities: ['Virtual Tabletop', 'Voice Chat', 'Screen Sharing'],
      icon: 'monitor',
      lat: 0,
      lon: 0,
      website: 'https://discord.gg/barades',
    },
  });

  console.log(`✅ Created ${3} locations\n`);

  // ============================================
  // 4. Create Sessions
  // ============================================
  console.log('🎲 Creating sessions...');

  const dndSession = await prisma.session.create({
    data: {
      game: 'Dungeons & Dragons 5e',
      title: 'The Lost Mines of Phandelver - Session 3',
      description: 'Continuing our epic adventure! We left off at the entrance of the goblin cave. New players welcome if you can catch up quickly.',
      date: new Date('2025-10-20T19:00:00Z'),
      online: false,
      level: SessionLevel.INTERMEDIATE,
      playersMax: 5,
      tagColor: TagColor.PURPLE,
      hostId: alice.id,
      locationId: gameStoreBrussels.id,
    },
  });

  const catanSession = await prisma.session.create({
    data: {
      game: 'Catan',
      title: 'Catan Tournament - Qualifier Round',
      description: 'Join us for a competitive Catan tournament! Prizes for top 3 players. Bring your A-game!',
      date: new Date('2025-10-18T18:00:00Z'),
      online: false,
      level: SessionLevel.ADVANCED,
      playersMax: 4,
      tagColor: TagColor.RED,
      hostId: bob.id,
      locationId: cafeJoystick.id,
    },
  });

  const pokerSession = await prisma.session.create({
    data: {
      game: 'Texas Hold\'em Poker',
      title: 'Friday Night Poker - €20 Buy-in',
      description: 'Casual poker night with friendly competition. €20 buy-in, winner takes 70%, second 30%.',
      date: new Date('2025-10-17T20:00:00Z'),
      online: false,
      level: SessionLevel.OPEN,
      playersMax: 8,
      tagColor: TagColor.GREEN,
      hostId: dave.id,
      locationId: cafeJoystick.id,
    },
  });

  const pathfinderRecurring = await prisma.session.create({
    data: {
      game: 'Pathfinder 2e',
      title: 'Age of Ashes Campaign - Weekly',
      description: 'Long-term Pathfinder 2e campaign running every Tuesday. Currently level 5, looking for 1 more player to replace a dropout.',
      date: new Date('2025-10-21T19:30:00Z'),
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU',
      recurrenceEndDate: new Date('2025-12-31T23:59:59Z'),
      online: true,
      level: SessionLevel.INTERMEDIATE,
      playersMax: 4,
      tagColor: TagColor.BLUE,
      hostId: alice.id,
      locationId: onlineLocation.id,
    },
  });

  const wingspanSession = await prisma.session.create({
    data: {
      game: 'Wingspan',
      title: 'Wingspan - Beginner Friendly!',
      description: 'Learn to play Wingspan with experienced players. We\'ll teach you the rules and strategies. Perfect for newcomers!',
      date: new Date('2025-10-19T15:00:00Z'),
      online: false,
      level: SessionLevel.BEGINNER,
      playersMax: 4,
      tagColor: TagColor.GRAY,
      hostId: bob.id,
      locationId: gameStoreBrussels.id,
    },
  });

  console.log(`✅ Created ${5} sessions\n`);

  // ============================================
  // 5. Create Groups
  // ============================================
  console.log('👨‍👩‍👧‍👦 Creating groups...');

  const adventurersGroup = await prisma.group.create({
    data: {
      name: 'Brussels Adventurers Guild',
      games: ['D&D 5e', 'Pathfinder 2e', 'Call of Cthulhu'],
      location: 'Brussels',
      playstyle: Playstyle.STORY_DRIVEN,
      description: 'A community of tabletop RPG enthusiasts in Brussels. We organize weekly sessions and one-shots. All experience levels welcome!',
      recruiting: true,
      isPublic: true, // Public group - visible to everyone
      avatar: 'https://picsum.photos/seed/adventurers/200',
      creatorId: alice.id,
    },
  });

  const boardGamersGroup = await prisma.group.create({
    data: {
      name: 'Casual Board Gamers',
      games: ['Catan', 'Ticket to Ride', 'Wingspan', 'Azul', 'Splendor'],
      location: 'Brussels',
      playstyle: Playstyle.CASUAL,
      description: 'Relaxed group for board game lovers. We meet every weekend to try new games and have fun. No competitive pressure!',
      recruiting: true,
      isPublic: true, // Public group - visible to everyone
      avatar: 'https://picsum.photos/seed/boardgamers/200',
      creatorId: bob.id,
    },
  });

  const elitePlayersGroup = await prisma.group.create({
    data: {
      name: 'Elite Strategy Players',
      games: ['Twilight Imperium', 'Gloomhaven', 'Mage Knight'],
      location: 'Brussels',
      playstyle: Playstyle.COMPETITIVE,
      description: 'Private group for experienced players. Invitation only. We focus on complex strategy games and competitive play.',
      recruiting: false,
      isPublic: false, // Private group - only visible to members
      avatar: 'https://picsum.photos/seed/elite/200',
      creatorId: dave.id,
    },
  });

  console.log(`✅ Created ${3} groups (2 public, 1 private)\n`);

  // ============================================
  // 6. Create Group Members
  // ============================================
  console.log('🤝 Creating group memberships...');

  await prisma.groupMember.createMany({
    data: [
      // Brussels Adventurers Guild (public)
      { userId: alice.id, groupId: adventurersGroup.id, role: GroupRole.ADMIN },
      { userId: carol.id, groupId: adventurersGroup.id, role: GroupRole.MEMBER },
      { userId: eve.id, groupId: adventurersGroup.id, role: GroupRole.MEMBER },

      // Casual Board Gamers (public)
      { userId: bob.id, groupId: boardGamersGroup.id, role: GroupRole.ADMIN },
      { userId: carol.id, groupId: boardGamersGroup.id, role: GroupRole.MEMBER },
      { userId: dave.id, groupId: boardGamersGroup.id, role: GroupRole.MEMBER },

      // Elite Strategy Players (private - only dave and alice are members)
      { userId: dave.id, groupId: elitePlayersGroup.id, role: GroupRole.ADMIN },
      { userId: alice.id, groupId: elitePlayersGroup.id, role: GroupRole.MEMBER },
    ],
  });

  console.log(`✅ Created ${8} group memberships\n`);

  // ============================================
  // 7. Create Reservations
  // ============================================
  console.log('📝 Creating reservations...');

  await prisma.reservation.createMany({
    data: [
      // D&D Session
      {
        sessionId: dndSession.id,
        userId: carol.id,
        status: ReservationStatus.CONFIRMED,
        message: 'This is my first D&D session, looking forward to it!',
      },
      {
        sessionId: dndSession.id,
        userId: eve.id,
        status: ReservationStatus.CONFIRMED,
      },
      {
        sessionId: dndSession.id,
        userId: bob.id,
        status: ReservationStatus.PENDING,
        message: 'Can I join if I\'m 15 minutes late?',
      },

      // Catan Tournament
      {
        sessionId: catanSession.id,
        userId: dave.id,
        status: ReservationStatus.CONFIRMED,
      },
      {
        sessionId: catanSession.id,
        userId: alice.id,
        status: ReservationStatus.CONFIRMED,
      },

      // Poker Night
      {
        sessionId: pokerSession.id,
        userId: alice.id,
        status: ReservationStatus.CONFIRMED,
      },
      {
        sessionId: pokerSession.id,
        userId: bob.id,
        status: ReservationStatus.CONFIRMED,
      },
      {
        sessionId: pokerSession.id,
        userId: carol.id,
        status: ReservationStatus.PENDING,
        message: 'First time playing poker for money, is €20 the minimum?',
      },

      // Pathfinder Recurring
      {
        sessionId: pathfinderRecurring.id,
        userId: eve.id,
        status: ReservationStatus.CONFIRMED,
      },

      // Wingspan Beginner
      {
        sessionId: wingspanSession.id,
        userId: carol.id,
        status: ReservationStatus.CONFIRMED,
        message: 'Never played before but love bird watching!',
      },
    ],
  });

  console.log(`✅ Created ${10} reservations\n`);

  // ============================================
  // 8. Create Polls
  // ============================================
  console.log('🗳️  Creating polls...');

  await prisma.poll.create({
    data: {
      groupId: adventurersGroup.id,
      title: 'Best date for next one-shot campaign?',
      dates: ['2025-10-25', '2025-10-26', '2025-11-01'],
      votes: {
        [alice.id]: '2025-10-26',
        [carol.id]: '2025-10-25',
        [eve.id]: '2025-10-26',
      },
    },
  });

  console.log(`✅ Created ${1} poll\n`);

  // ============================================
  // Summary
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`
📊 Summary:
   • ${5} Users (alice, bob, carol, dave, eve)
   • ${3} Locations (Brussels Game Store, Café Joystick, Online)
   • ${5} Sessions (D&D, Catan, Poker, Pathfinder, Wingspan)
   • ${3} Groups (2 public: Adventurers Guild, Casual Board Gamers | 1 private: Elite Strategy Players)
   • ${8} Group Memberships
   • ${10} Reservations (mix of pending/confirmed)
   • ${1} Poll

🔑 Test credentials:
   Email: alice@barades.com | Password: password123
   Email: bob@barades.com   | Password: password123
   Email: carol@barades.com | Password: password123
   Email: dave@barades.com  | Password: password123
   Email: eve@barades.com   | Password: password123

🔒 Private Group Access:
   • "Elite Strategy Players" is PRIVATE - only visible to members (dave, alice)
   • Login as bob/carol/eve to see that this group is hidden
   • Login as alice/dave to access it
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
