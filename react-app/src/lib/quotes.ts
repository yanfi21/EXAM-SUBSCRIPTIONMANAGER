export interface Quote {
  content: string;
  author: string;
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

export function localQuoteOfTheDay(now: Date = new Date()): Quote {
  const dayNumber = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
  return FALLBACK_QUOTES[dayNumber % FALLBACK_QUOTES.length];
}

export async function fetchQuoteOfTheDay(signal?: AbortSignal): Promise<Quote> {
  try {
    const response = await fetch('https://api.quotable.io/quotes/random?maxLength=120', { signal });
    if (!response.ok) {
      throw new Error('bad response');
    }
    const payload = (await response.json()) as Array<{ content?: string; author?: string }>;
    const first = Array.isArray(payload) ? payload[0] : null;
    if (first?.content) {
      return { content: first.content, author: first.author ?? 'Неизвестный автор' };
    }
    throw new Error('empty payload');
  } catch {
    return localQuoteOfTheDay();
  }
}
