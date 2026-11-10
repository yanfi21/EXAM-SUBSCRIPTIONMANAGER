import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

describe('App', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('рендерит каркас приложения и список задач с демо-данными', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const text = container.textContent ?? '';
    expect(text).toContain('Задачи и заметки');
    expect(text).toContain('Канбан-доска');
    expect(text).toContain('Подготовить отчёт по практике');
    expect(text).toContain('support@tasknotes.app');
    expect(localStorage.getItem('tasknotes.tasks')).not.toBeNull();
  });
});
