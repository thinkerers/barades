import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionCardComponent } from '../sessions/session-card';
import { GroupCardComponent } from '../groups/group-card';
import { PollWidgetComponent } from '../groups/poll-widget';

@Component({
  selector: 'app-showcase-page',
  imports: [
    CommonModule,
    SessionCardComponent,
    GroupCardComponent,
    PollWidgetComponent,
  ],
  templateUrl: './showcase-page.html',
  styleUrl: './showcase-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePage {
  // Sample data for showcase
  sampleSession = {
    id: 'showcase-1',
    title: 'Dungeons & Dragons 5e',
    description: 'Aventure épique pour débutants et intermédiaires. Plongez dans un monde de magie et de mystères avec des compagnons passionnés.',
    game: 'D&D 5e',
    maxPlayers: 6,
    level: 'BEGINNER' as const,
    sessionType: 'TABLE' as const,
    date: new Date('2025-10-19T14:00:00'),
    location: {
      id: 'loc-1',
      name: 'Café Joystick',
      city: 'Brussels',
      lat: 50.8317,
      lon: 4.3657,
    },
    host: {
      id: 'user-1',
      username: 'alice_dm',
      email: 'alice@example.com',
    },
    reservations: [
      { id: '1', status: 'CONFIRMED' as const },
      { id: '2', status: 'CONFIRMED' as const },
      { id: '3', status: 'CONFIRMED' as const },
    ],
    tagColor: 'GREEN' as const,
  };

  sampleGroup = {
    id: 'group-1',
    name: 'Brussels Adventurers Guild',
    description: 'Groupe convivial de joueurs basés à Bruxelles. Sessions régulières de D&D, Pathfinder et autres systèmes.',
    playstyle: 'CASUAL' as const,
    games: ['D&D 5e', 'Pathfinder', 'Call of Cthulhu'],
    members: [
      { id: '1', username: 'alice_dm' },
      { id: '2', username: 'bob_warrior' },
      { id: '3', username: 'carol_newbie' },
      { id: '4', username: 'dave_veteran' },
    ],
    recruiting: true,
  };

  samplePoll = {
    id: 'poll-1',
    title: 'Best date for next one-shot campaign?',
    dates: ['2025-10-25', '2025-10-26', '2025-11-01'],
    votes: {} as Record<string, string>,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    groupId: 'group-1',
    voteDetails: {
      '2025-10-25': [
        { userId: 'user-1', username: 'alice_dm' },
        { userId: 'user-2', username: 'bob_warrior' },
      ],
      '2025-10-26': [
        { userId: 'user-1', username: 'alice_dm' },
        { userId: 'user-3', username: 'carol_newbie' },
      ],
      '2025-11-01': [
        { userId: 'user-3', username: 'carol_newbie' },
      ],
    },
    voteCounts: {
      '2025-10-25': 2,
      '2025-10-26': 2,
      '2025-11-01': 1,
    },
    bestDate: '2025-10-25',
    totalVotes: 3,
  };
}
