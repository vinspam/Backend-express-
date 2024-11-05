export enum WorkoutBodyPart {
  FULL_BODY = 'FULL_BODY',
  LOWER_BODY = 'LOWER_BODY',
  UPPER_BODY = 'UPPER_BODY',
  ABS = 'ABS',
}

export enum WorkoutStyle {
  RUN = 'RUN',
  BARRE = 'BARRE',
  PILATES = 'PILATES',
  STRENGTH = 'STRENGTH',
  CYCLING = 'CYCLING',
  YOGA = 'YOGA',
  HIIT = 'HIIT',
}

export enum NodeDifficult {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export const VIMEO_VIDEO_URL_REGEXP = /^(https:\/\/vimeo.com\/)(\d+)(\/[a-z0-9]+)?/;
