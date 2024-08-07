export interface GuessGenderInput {
  id: number;
  name: string;
}

export interface GuessGenderOutput {
  gender: 'male' | 'female' | 'unknown';
  probability: number;  
}