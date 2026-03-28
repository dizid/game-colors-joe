// The humor engine - makes Joe's Splat Factory actually funny

// Joe's face reactions - emoji-based character that lives in the HUD
export type JoeMood = 'idle' | 'excited' | 'hyped' | 'godmode' | 'disappointed' | 'bored' | 'shocked' | 'sleeping'

export const JOE_FACES: Record<JoeMood, string> = {
  idle: '😎',
  excited: '🤩',
  hyped: '🤯',
  godmode: '👑',
  disappointed: '😐',
  bored: '🥱',
  shocked: '😱',
  sleeping: '😴',
}

export function getJoeMood(combo: number, timeSinceLastSplat: number, isComplete: boolean): JoeMood {
  if (isComplete) return 'excited'
  if (timeSinceLastSplat > 8) return 'sleeping'
  if (timeSinceLastSplat > 4) return 'bored'
  if (combo >= 10) return 'godmode'
  if (combo >= 5) return 'hyped'
  if (combo >= 2) return 'excited'
  if (combo === 0 && timeSinceLastSplat > 2) return 'disappointed'
  return 'idle'
}

// Random funny quips that float up on splats
const SPLAT_QUIPS = [
  'SPLAT!',
  'SPLOOOSH!',
  'YEET!',
  'Take THAT, canvas!',
  'Art!',
  'Beautiful mess!',
  'Mom would cry!',
  'Gallery worthy!',
  'Pollock vibes!',
  'KABLOOEY!',
  'Wet & wild!',
  'Drip drop!',
  'Squishy!',
  'THWACK!',
  'Blob-tastic!',
]

const FAST_FLING_QUIPS = [
  'WHOOOOSH!',
  'Sonic speed!',
  'Turbo splat!',
  'Need for speed!',
  'ZOOM SPLAT!',
  'Lightning fling!',
  'Faster than tuk-tuk!',
  'That was VIOLENT!',
]

const CORNER_QUIPS = [
  'CORNER POCKET!',
  'Sniper shot!',
  'Right in the corner!',
  'Bullseye!',
  'Surgical precision!',
  'How did you even!?',
]

const EDGE_QUIPS = [
  'Edge lord!',
  'Living on the edge!',
  'Barely made it!',
  'Risky painter!',
  'Edgy!',
]

export function getSplatQuip(bonuses: string[], speed: number): string | null {
  // Only show quips ~40% of the time so they don't get annoying
  if (Math.random() > 0.4) return null

  if (bonuses.includes('CORNER SHOT!')) {
    return CORNER_QUIPS[Math.floor(Math.random() * CORNER_QUIPS.length)]
  }
  if (bonuses.includes('Edge Shot!')) {
    return EDGE_QUIPS[Math.floor(Math.random() * EDGE_QUIPS.length)]
  }
  if (speed > 400) {
    return FAST_FLING_QUIPS[Math.floor(Math.random() * FAST_FLING_QUIPS.length)]
  }
  return SPLAT_QUIPS[Math.floor(Math.random() * SPLAT_QUIPS.length)]
}

// Idle taunts - when Joe gets bored waiting for you to paint
const IDLE_TAUNTS = [
  "Paint won't fling itself...",
  "Hello? The canvas is waiting!",
  "Joe's falling asleep here...",
  "The paint is drying out!",
  "*taps foot impatiently*",
  "Even the paint is bored",
  "Did you forget how fingers work?",
  "The canvas called. It wants color.",
  "Psst... swipe the screen!",
  "Joe went to get ice cream...",
  "Are we painting or napping?",
  "The brush is judging you",
  "Joe started a new painting without you",
]

let lastTauntIndex = -1

export function getIdleTaunt(): string {
  let idx = Math.floor(Math.random() * IDLE_TAUNTS.length)
  while (idx === lastTauntIndex) {
    idx = Math.floor(Math.random() * IDLE_TAUNTS.length)
  }
  lastTauntIndex = idx
  return IDLE_TAUNTS[idx]
}

// Combo break reactions - when you lose your combo
const COMBO_BREAK_REACTIONS = [
  'Oops!',
  'Nooo!',
  'RIP combo',
  'The streak!',
  'Gone!',
  '*sad paint noises*',
  'F in chat',
  'Joe is disappointed',
  'Combo machine broke',
  'That hurt',
]

export function getComboBreakText(lostCombo: number): string | null {
  if (lostCombo < 3) return null
  const texts = COMBO_BREAK_REACTIONS
  return texts[Math.floor(Math.random() * texts.length)]
}

// Game over titles - way more hilarious based on score/performance
export function getFunnyEndTitle(score: number, splatCount: number, maxCombo: number, coverage: number): string {
  // Special cases first
  if (splatCount === 0) return "You didn't even try!"
  if (splatCount === 1) return 'One and done, huh?'
  if (maxCombo >= 15) return 'COMBO DEMON!'
  if (coverage >= 90) return 'NOT A SINGLE WHITE PIXEL!'

  if (score >= 8000) return 'PICASSO IS SHAKING!'
  if (score >= 5000) return 'JOE APPROVES!'
  if (score >= 3000) return 'Mom would frame this!'
  if (score >= 2000) return 'Museum quality chaos!'
  if (score >= 1000) return 'Getting dangerous!'
  if (score >= 500) return 'Not bad, not bad...'
  if (score >= 200) return 'Baby steps!'
  return 'At least you tried!'
}

export function getFunnyEndSubtitle(_score: number, splatCount: number, maxCombo: number, _coverage: number): string {
  const parts: string[] = []

  // Splat count commentary
  if (splatCount >= 50) parts.push(`${splatCount} splats! Your finger must hurt`)
  else if (splatCount >= 20) parts.push(`${splatCount} splats of pure chaos`)
  else if (splatCount >= 5) parts.push(`${splatCount} careful splats`)
  else parts.push(`Just ${splatCount} splats? Really?`)

  // Combo commentary
  if (maxCombo >= 10) parts.push(`x${maxCombo} combo! LEGENDARY`)
  else if (maxCombo >= 5) parts.push(`x${maxCombo} combo streak`)
  else if (maxCombo >= 2) parts.push(`x${maxCombo} combo (we've seen better)`)
  else parts.push('No combos (ouch)')

  return parts.join(' | ')
}

// Coverage descriptions for the game over modal
export function getFunnyCoverageLabel(pct: number): string {
  if (pct >= 90) return 'CANVAS OBLITERATED'
  if (pct >= 80) return 'JOE APPROVED'
  if (pct >= 60) return 'Professional Mess'
  if (pct >= 40) return 'Getting Somewhere'
  if (pct >= 20) return 'Mildly Messy'
  if (pct >= 5) return 'Shy Painter'
  return 'Did you even paint?'
}

// Menu taglines that rotate
const MENU_TAGLINES = [
  'Fling paint. Make art. Get messy.',
  'No walls were harmed in the making of this game.',
  'Jackson Pollock would be proud. Probably.',
  "Warning: May cause uncontrollable finger swiping.",
  "Your mom said it's okay to make a mess.",
  'Abstract art speedrun.',
  '100% organic, free-range paint splatters.',
  'The only game where making a mess is the goal.',
  "Picasso called. He wants his chaos back.",
  'Swipe responsibly. Or don\'t. We don\'t care.',
]

export function getRandomTagline(): string {
  return MENU_TAGLINES[Math.floor(Math.random() * MENU_TAGLINES.length)]
}

// Rare random events that happen during gameplay
export type SillyEvent = {
  text: string
  emoji: string
  bonusPoints: number
  duration: number // ms to show
}

export function rollForSillyEvent(splatCount: number): SillyEvent | null {
  // 3% chance per splat after the 5th splat
  if (splatCount < 5 || Math.random() > 0.03) return null

  const events: SillyEvent[] = [
    { text: 'GOLDEN SPLAT!', emoji: '✨', bonusPoints: 500, duration: 2000 },
    { text: 'PAINT SNEEZE!', emoji: '🤧', bonusPoints: 300, duration: 1500 },
    { text: 'DOUBLE RAINBOW!', emoji: '🌈', bonusPoints: 250, duration: 1500 },
    { text: 'Joe did a backflip!', emoji: '🤸', bonusPoints: 200, duration: 2000 },
    { text: 'MEGA BLOB!', emoji: '🫧', bonusPoints: 400, duration: 1500 },
    { text: 'ART CRITIC IMPRESSED!', emoji: '🧐', bonusPoints: 350, duration: 2000 },
    { text: 'Paint bucket overflow!', emoji: '🪣', bonusPoints: 150, duration: 1500 },
    { text: 'TURBO MODE!', emoji: '🚀', bonusPoints: 300, duration: 1500 },
  ]

  return events[Math.floor(Math.random() * events.length)]
}
