import type { League } from '../types'

// Demo leagues. Points are synthetic; the demo user's own points are always
// computed from their actual guesses.
export const DEMO_LEAGUES: League[] = [
  {
    id: 'offentlig',
    name: 'Offentlig liga',
    kind: 'public',
    color: '#111111',
    size: 4520,
    members: [
      { id: 'o1', name: 'Gættekongen', base: 1210, prevDelta: 100, daily: [100, 50, 150] },
      { id: 'o2', name: 'Superliga_Sanne', base: 1185, prevDelta: 150, daily: [50, 100, 100] },
      { id: 'o3', name: 'Mads fra Mors', base: 1160, prevDelta: 50, daily: [150, 0, 100] },
      { id: 'o4', name: 'Bornholmer_B', base: 1102, prevDelta: 100, daily: [100, 100, 50] },
      { id: 'o5', name: 'Kaffe&Kort', base: 1090, prevDelta: 0, daily: [50, 150, 0] },
    ],
  },
  {
    id: 'ekspert',
    name: 'Ekspert-dysten',
    kind: 'expert',
    color: '#D6001C',
    members: [
      { id: 'e1', name: 'Sportsværten', role: 'Fiktiv DR-ekspert', base: 520, prevDelta: 100, daily: [50, 100] },
      { id: 'e2', name: 'Økonomikorrespondenten', role: 'Fiktiv DR-ekspert', base: 470, prevDelta: 0, daily: [100, 0] },
      { id: 'e3', name: 'Musikredaktøren', role: 'Fiktiv DR-ekspert', base: 365, prevDelta: 150, daily: [0, 50] },
      { id: 'e4', name: 'Vejrværten', role: 'Fiktiv DR-ekspert', base: 340, prevDelta: 100, daily: [100, 100] },
      { id: 'e5', name: 'Politisk analytiker', role: 'Fiktiv DR-ekspert', base: 300, prevDelta: 50, daily: [15, 50] },
      { id: 'e6', name: 'Kulturværten', role: 'Fiktiv DR-ekspert', base: 250, prevDelta: 0, daily: [50, 0] },
      { id: 'e7', name: 'Håndboldkommentatoren', role: 'Fiktiv DR-ekspert', base: 215, prevDelta: 50, daily: [0, 100] },
    ],
  },
  {
    id: 'studiegruppen',
    name: 'Studiegruppen',
    kind: 'private',
    color: '#1F6FEB',
    code: 'DR2026',
    members: [
      { id: 's1', name: 'Mathilde', base: 560, prevDelta: 50, daily: [50, 100] },
      { id: 's2', name: 'Jonas', base: 470, prevDelta: 0, daily: [0, 50] },
      { id: 's3', name: 'Sofie', base: 430, prevDelta: 50, daily: [15, 100] },
      { id: 's4', name: 'Emil', base: 320, prevDelta: 0, daily: [0, 150] },
      { id: 's5', name: 'Freja', base: 260, prevDelta: 0, daily: [50, 0] },
    ],
  },
  {
    id: 'familien',
    name: 'Familien',
    kind: 'private',
    color: '#0E8A5F',
    code: 'FAM123',
    members: [
      { id: 'f1', name: 'Mor', base: 610, prevDelta: 100, daily: [100, 0] },
      { id: 'f2', name: 'Farfar Erik', base: 350, prevDelta: 0, daily: [0, 100] },
      { id: 'f3', name: 'Lillebror', base: 180, prevDelta: 50, daily: [50, 50] },
    ],
  },
  {
    id: 'haandbold',
    name: 'Håndboldholdet',
    kind: 'private',
    color: '#E07A00',
    code: 'HAND26',
    members: [
      { id: 'h1', name: 'Træner Bo', base: 690, prevDelta: 100, daily: [100, 50] },
      { id: 'h2', name: 'Line', base: 520, prevDelta: 50, daily: [0, 100] },
      { id: 'h3', name: 'Kasper', base: 410, prevDelta: 0, daily: [150, 0] },
      { id: 'h4', name: 'Nanna', base: 390, prevDelta: 100, daily: [50, 50] },
      { id: 'h5', name: 'Ahmad', base: 300, prevDelta: 0, daily: [100, 0] },
      { id: 'h6', name: 'Rikke', base: 205, prevDelta: 15, daily: [0, 15] },
    ],
  },
]

/** Leagues the demo account is already a member of when logging in. */
export const DEMO_ACCOUNT_LEAGUES = ['offentlig', 'ekspert', 'studiegruppen', 'familien']

export const LEAGUE_COLORS = ['#1F6FEB', '#0E8A5F', '#E07A00', '#7B3FE4', '#D6001C', '#111111']
