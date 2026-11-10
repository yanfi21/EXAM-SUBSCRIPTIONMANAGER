import { Injectable, inject } from '@angular/core';
import type { AppSnapshot } from '../models/models';
import { createSnapshot, downloadSnapshot, parseSnapshot, type ImportResult } from '../utils/backup.util';
import { toDateKey } from '../utils/date.util';
import { FeedbackService } from './feedback.service';
import { NoteService } from './note.service';
import { PreferencesService } from './preferences.service';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class BackupService {
  private readonly tasks = inject(TaskService);
  private readonly notes = inject(NoteService);
  private readonly feedback = inject(FeedbackService);
  private readonly preferences = inject(PreferencesService);

  snapshot(): AppSnapshot {
    return createSnapshot(
      this.tasks.tasks(),
      this.notes.notes(),
      this.feedback.entries(),
      this.preferences.preferences(),
    );
  }

  export(): void {
    downloadSnapshot(this.snapshot(), `tasknotes-${toDateKey(new Date())}.json`);
  }

  import(payload: string, mode: 'replace' | 'merge'): ImportResult {
    const result = parseSnapshot(payload);
    if (mode === 'replace') {
      this.tasks.replaceAll(result.snapshot.tasks);
      this.notes.replaceAll(result.snapshot.notes);
      this.feedback.replaceAll(result.snapshot.feedback);
      this.preferences.replace(result.snapshot.preferences);
    } else {
      this.tasks.mergeAll(result.snapshot.tasks);
      this.notes.mergeAll(result.snapshot.notes);
    }
    return result;
  }

  loadDemo(): void {
    this.tasks.loadDemo();
    this.notes.loadDemo();
  }

  resetAll(): void {
    this.tasks.clear();
    this.notes.clear();
    this.feedback.clear();
    this.preferences.reset();
  }
}
