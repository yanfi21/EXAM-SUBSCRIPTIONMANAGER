import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, map, of, timeout } from 'rxjs';

export interface Quote {
  content: string;
  author: string;
}

interface QuotableItem {
  content?: string;
  author?: string;
}

const FALLBACK_QUOTES: Quote[] = [
  { content: 'Лучший способ начать — перестать говорить и начать делать.', author: 'Уолт Дисней' },
  { content: 'Сделанное лучше идеального.', author: 'Шерил Сэндберг' },
  { content: 'Дисциплина — это мост между целью и результатом.', author: 'Джим Рон' },
  { content: 'Маленькие шаги каждый день приводят к большим результатам.', author: 'Роберт Кольер' },
  { content: 'Не откладывай на завтра то, что можно сделать за пять минут.', author: 'Дэвид Аллен' },
  { content: 'Фокус — это умение говорить «нет» лишнему.', author: 'Стив Джобс' },
  { content: 'План без действия — просто список желаний.', author: 'Антуан де Сент-Экзюпери' },
];

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Quote>(QuoteService.localQuote());

  readonly quote = this.state.asReadonly();

  static localQuote(now: Date = new Date()): Quote {
    const dayNumber = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
    return FALLBACK_QUOTES[dayNumber % FALLBACK_QUOTES.length];
  }

  load(): void {
    this.http
      .get<QuotableItem[]>('https://api.quotable.io/quotes/random?maxLength=120')
      .pipe(
        timeout(4000),
        map((payload) => {
          const first = Array.isArray(payload) ? payload[0] : null;
          if (!first?.content) {
            throw new Error('empty payload');
          }
          return { content: first.content, author: first.author ?? 'Неизвестный автор' };
        }),
        catchError(() => of(QuoteService.localQuote())),
      )
      .subscribe((quote) => this.state.set(quote));
  }
}
