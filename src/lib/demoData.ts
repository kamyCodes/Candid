import { Candidate, Note, ActivityLogEntry, Stage } from './types';
import { uid } from './candidates';

const daysAgo = (days: number, hours = 0) =>
  new Date(Date.now() - days * 864e5 - hours * 36e5).toISOString();

const note = (content: string, author: string, days: number, hours = 0): Note => ({
  id: uid(),
  content,
  author,
  createdAt: daysAgo(days, hours),
});

interface DemoPerson {
  name: string;
  email: string;
  phone?: string;
  position: string;
  stage: Stage;
  rating: number;
  experienceLevel: Candidate['experienceLevel'];
  source: Candidate['source'];
  linkedIn?: string;
  createdDaysAgo: number;
  notes: Note[];
}

const PEOPLE: DemoPerson[] = [
  {
    name: 'Maya Chen',
    email: 'maya.chen@gmail.com',
    phone: '+1 (415) 555-0142',
    position: 'Product Designer',
    stage: 'interview',
    rating: 4,
    experienceLevel: 'mid',
    source: 'linkedin',
    linkedIn: 'https://linkedin.com/in/mayachen',
    createdDaysAgo: 6,
    notes: [note('Portfolio is strong. Referenced by Dana.', 'Priya', 1)],
  },
  {
    name: 'Jonas Weber',
    email: 'jonas.weber@outlook.com',
    position: 'Backend Engineer',
    stage: 'interview',
    rating: 5,
    experienceLevel: 'senior',
    source: 'referral',
    createdDaysAgo: 9,
    notes: [
      note('Great systems design round. Wants to lead the migration.', 'Sam', 2),
      note('Availability: 4 weeks notice.', 'Sam', 1),
    ],
  },
  {
    name: 'Aisha Patel',
    email: 'aisha.p@hey.com',
    phone: '+44 20 7946 0958',
    position: 'Growth Marketer',
    stage: 'test',
    rating: 3,
    experienceLevel: 'mid',
    source: 'job-board',
    createdDaysAgo: 4,
    notes: [],
  },
  {
    name: 'Tom Okafor',
    email: 't.okafor@proton.me',
    position: 'Data Analyst',
    stage: 'offer',
    rating: 5,
    experienceLevel: 'entry',
    source: 'career-site',
    linkedIn: 'https://linkedin.com/in/tomokafor',
    createdDaysAgo: 12,
    notes: [note('Sent offer at 200k plus equity.', 'Hiring lead', 1)],
  },
  {
    name: 'Lucia Rossi',
    email: 'lucia.rossi@gmail.com',
    phone: '+39 345 123 4567',
    position: 'Frontend Engineer',
    stage: 'applied',
    rating: 4,
    experienceLevel: 'mid',
    source: 'cold-outreach',
    linkedIn: 'https://linkedin.com/in/luciarossi',
    createdDaysAgo: 1,
    notes: [],
  },
  {
    name: 'Elena Kim',
    email: 'elena.kim@hey.com',
    position: 'Engineering Manager',
    stage: 'accepted',
    rating: 5,
    experienceLevel: 'lead',
    source: 'referral',
    createdDaysAgo: 18,
    notes: [
      note('Countered and accepted. Start date confirmed for the 21st.', 'Priya', 3),
      note('Team unanimously positive after the panel round.', 'Sam', 8),
    ],
  },
  {
    name: 'Marcus Bell',
    email: 'm.bell@outlook.com',
    phone: '+1 (917) 555-0188',
    position: 'DevOps Engineer',
    stage: 'rejected',
    rating: 2,
    experienceLevel: 'senior',
    source: 'agency',
    createdDaysAgo: 15,
    notes: [note('Salary expectations well above band for this level.', 'Hiring lead', 6)],
  },
];

export function createDemoData(): { candidates: Candidate[]; activityLog: ActivityLogEntry[] } {
  const candidates: Candidate[] = PEOPLE.map((person) => {
    const created = daysAgo(person.createdDaysAgo);
    const lastTouch = person.notes[person.notes.length - 1]?.createdAt ?? created;
    return {
      id: uid(),
      name: person.name,
      email: person.email,
      phone: person.phone ?? '',
      position: person.position,
      stage: person.stage,
      rating: person.rating,
      experienceLevel: person.experienceLevel,
      source: person.source,
      linkedIn: person.linkedIn ?? '',
      notes: person.notes,
      createdAt: created,
      updatedAt: lastTouch,
    };
  });

  const byName = (name: string) => candidates.find((c) => c.name === name)!;

  const activityLog: ActivityLogEntry[] = [
    {
      id: uid(),
      candidateId: byName('Jonas Weber').id,
      candidateName: 'Jonas Weber',
      action: 'Stage Changed',
      details: 'Moved from test to interview',
      timestamp: daysAgo(3),
    },
    {
      id: uid(),
      candidateId: byName('Maya Chen').id,
      candidateName: 'Maya Chen',
      action: 'Note Added',
      details: 'New note by Priya',
      timestamp: daysAgo(1),
    },
    {
      id: uid(),
      candidateId: byName('Elena Kim').id,
      candidateName: 'Elena Kim',
      action: 'Rating Updated',
      details: 'Rating set to 5/5',
      timestamp: daysAgo(5),
    },
    {
      id: uid(),
      candidateId: byName('Tom Okafor').id,
      candidateName: 'Tom Okafor',
      action: 'Stage Changed',
      details: 'Moved from interview to offer',
      timestamp: daysAgo(7),
    },
    {
      id: uid(),
      candidateId: byName('Marcus Bell').id,
      candidateName: 'Marcus Bell',
      action: 'Deleted',
      details: 'Removed from pipeline',
      timestamp: daysAgo(9),
    },
    {
      id: uid(),
      candidateId: byName('Aisha Patel').id,
      candidateName: 'Aisha Patel',
      action: 'Created',
      details: 'Added to pipeline as test',
      timestamp: daysAgo(4),
    },
  ];

  return { candidates, activityLog };
}
