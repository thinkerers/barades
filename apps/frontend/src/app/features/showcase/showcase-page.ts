import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GroupCardComponent } from '@org/ui';
import { Group } from '../../core/services/groups.service';
import { Poll } from '../../core/services/polls.service';
import { Session } from '../../core/services/sessions.service';
import { PollWidgetComponent } from '../groups/poll-widget';
import { SessionCardComponent } from '../sessions/session-card';

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
  // Sample data for showcase (typed to match frontend service interfaces)
  sampleSession: Session = {
    id: 'showcase-1',
    game: 'D&D 5e',
    title: 'Dungeons & Dragons 5e',
    description:
      'Aventure épique pour débutants et intermédiaires. Plongez dans un monde de magie et de mystères avec des compagnons passionnés.',
    date: new Date('2025-10-19T14:00:00').toISOString(),
    recurrenceRule: null,
    recurrenceEndDate: null,
    online: false,
    level: 'BEGINNER',
    playersMax: 6,
    playersCurrent: 3,
    tagColor: 'GREEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hostId: 'user-1',
    locationId: 'loc-1',
    host: {
      id: 'user-1',
      username: 'alice_dm',
      avatar: null,
    },
    location: {
      id: 'loc-1',
      name: 'Café Joystick',
      city: 'Brussels',
      type: 'BAR',
      lat: 50.8317,
      lon: 4.3657,
    },
    reservations: [
      {
        id: '1',
        status: 'CONFIRMED',
        user: { id: 'u1', username: 'alice_dm', avatar: null },
      },
      {
        id: '2',
        status: 'CONFIRMED',
        user: { id: 'u2', username: 'bob_warrior', avatar: null },
      },
      {
        id: '3',
        status: 'CONFIRMED',
        user: { id: 'u3', username: 'carol_newbie', avatar: null },
      },
    ],
  };

  sampleGroup: Group = {
    id: 'group-1',
    name: 'Brussels Adventurers Guild',
    description:
      'Groupe convivial de joueurs basés à Bruxelles. Sessions régulières de D&D, Pathfinder et autres systèmes.',
    playstyle: 'CASUAL',
    isRecruiting: true,
    isPublic: true,
    maxMembers: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: 'user-1',
    _count: { members: 4 },
  };

  samplePoll: Poll = {
    id: 'poll-1',
    title: 'Best date for next one-shot campaign?',
    dates: ['2025-10-25', '2025-10-26', '2025-11-01'],
    votes: {},
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
      '2025-11-01': [{ userId: 'user-3', username: 'carol_newbie' }],
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
