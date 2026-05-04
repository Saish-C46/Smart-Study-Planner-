/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subject {
  id: string;
  name: string;
  deadline: string; // ISO date string
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
}

export interface StudyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  date: string; // YYYY-MM-DD
  duration: number; // minutes
  isCompleted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type Screen = 'landing' | 'auth' | 'welcome' | 'input' | 'dashboard' | 'progress';
