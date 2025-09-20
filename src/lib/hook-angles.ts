import { HookAngle } from '@/types'

export interface HookAngleDefinition {
  name: HookAngle
  label: string
  description: string
  example: string
}

export const HOOK_ANGLES: Record<HookAngle, HookAngleDefinition> = {
  FORTUNE_TELLER: {
    name: 'FORTUNE_TELLER',
    label: 'Fortune Teller',
    description: 'Pits today vs tomorrow to spark curiosity about what\'s coming.',
    example: 'This update will change how we edit videos next month.'
  },
  EXPERIMENTER: {
    name: 'EXPERIMENTER',
    label: 'Experimenter',
    description: '"I tried X so you don\'t have to." Shows a demo or test and what happened.',
    example: 'I used this workflow for 7 days—here\'s what actually worked.'
  },
  TEACHER: {
    name: 'TEACHER',
    label: 'Teacher',
    description: 'Extracts a lesson or framework and explains it step-by-step.',
    example: '3 rules I used to cut my render times in half.'
  },
  MAGICIAN: {
    name: 'MAGICIAN',
    label: 'Magician',
    description: 'Scroll-stopper using a striking visual/sound that forces attention.',
    example: 'Snap zoom on a wild before/after — "Watch this frame transform in 3 seconds."'
  },
  INVESTIGATOR: {
    name: 'INVESTIGATOR',
    label: 'Investigator',
    description: 'Reveals a hidden insight, secret, or under-the-radar finding.',
    example: 'The feature nobody mentions that doubles your click-through.'
  },
  CONTRARIAN: {
    name: 'CONTRARIAN',
    label: 'Contrarian',
    description: 'Takes a clear stance against common wisdom.',
    example: 'Stop using templates—this is why they\'re killing your brand.'
  }
}

export function getHookAngleByName(name: HookAngle): HookAngleDefinition {
  return HOOK_ANGLES[name]
}

export function getAllHookAngles(): HookAngleDefinition[] {
  return Object.values(HOOK_ANGLES)
}