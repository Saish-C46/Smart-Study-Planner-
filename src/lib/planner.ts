/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, StudyTask } from '../types';

/**
 * Generates a study plan based on subjects and their deadlines.
 * Distributes tasks relatively evenly across days from now until the deadline.
 */
export function generateStudyPlan(subjects: Subject[]): StudyTask[] {
  const tasks: StudyTask[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  subjects.forEach((subject) => {
    const deadlineDate = new Date(subject.deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    // Calculate days between now and deadline
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return;

    // Total estimated hours needed for a subject based on difficulty
    const totalHoursNeeded = {
      easy: 10,
      medium: 20,
      hard: 40,
    }[subject.difficulty];

    const totalMinutes = totalHoursNeeded * 60;
    const minutesPerDay = Math.ceil(totalMinutes / diffDays);

    // Create a task for each day up to the deadline
    for (let i = 0; i < diffDays; i++) {
        const taskDate = new Date(today);
        taskDate.setDate(today.getDate() + i);
        const dateStr = taskDate.toISOString().split('T')[0];

        tasks.push({
            id: `${subject.id}-task-${i}`,
            subjectId: subject.id,
            subjectName: subject.name,
            title: `Study session ${i + 1} for ${subject.name}`,
            date: dateStr,
            duration: Math.min(minutesPerDay, 120), // Cap at 2 hours per session
            isCompleted: false,
        });
    }
  });

  return tasks.sort((a, b) => a.date.localeCompare(b.date));
}
