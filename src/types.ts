
// Define types for input and output structures
export interface Inputs {
  gender: 'male' | 'female' | 'other';
  age_cat: string;
  edu_cat: string;
  bmi: string;
  cholesterol: 'high' | 'normal';
  low_hdl: 'yes' | 'no';
  high_ldl: 'yes' | 'no';
  diabetes: 'yes' | 'no';
  hbp: 'yes' | 'no';
  tbi: 'yes' | 'no';
  stroke: 'yes' | 'no';
  afib: 'yes' | 'no';
  heartattack: 'yes' | 'no';
  hearing_loss: 'yes' | 'no';
  falling_asleep: number;
  staying_asleep: number;
  waking_early: number;
  dissatisfaction: number;
  noticeable: number;
  worried: number;
  interfere: number;
  bothered: number;
  mind: number;
  depressed: number;
  effort: number;
  future: number;
  fearful: number;
  sleep: number;
  happy: number;
  lonely: number;
  going: number;
  vigorous: number;
  moderate: number;
  walk: number;
  newspaper: number;
  magazines: number;
  books: number;
  games: number;
  brain_training: number;
  emails: number;
  social_media: number;
  stimulating: number;
  other_freq: number;
  museum: number;
  concert: number;
  library: number;
  companion: number;
  left_out: number;
  isolated: number;
  fruitveg: number;
  fish_intake: number;
  alcohol: number;
  smoking: 'current' | 'non-smoker' | 'former';
}

export interface Scores {
  dementia_score: number;
  stroke_score: number;
  mi_score: number;
  diabetes_score: number;
}

export interface UnitData {
  [key: string]: number | string;
}

export interface OutputResult {
  scores: Scores,
  inputs: Inputs
}
