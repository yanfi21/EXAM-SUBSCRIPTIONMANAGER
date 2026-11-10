function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(value: string): string {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code class="rounded bg-subtle px-1 py-0.5 text-[0.85em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a class="text-brand underline" target="_blank" rel="noreferrer" href="$2">$1</a>',
    );
}

export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      return;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const sizes = ['text-xl', 'text-lg', 'text-base'];
      html.push(
        `<h${level + 2} class="${sizes[level - 1]} mt-3 mb-1 font-bold">${inline(heading[2])}</h${level + 2}>`,
      );
      return;
    }
    const checkbox = /^[-*]\s+\[([ xX])\]\s+(.*)$/.exec(trimmed);
    if (checkbox) {
      if (listType !== 'ul') {
        closeList();
        html.push('<ul class="my-1 space-y-1">');
        listType = 'ul';
      }
      const checked = checkbox[1].toLowerCase() === 'x';
      html.push(
        `<li class="flex items-start gap-2"><span>${checked ? '☑' : '☐'}</span><span class="${checked ? 'line-through opacity-60' : ''}">${inline(checkbox[2])}</span></li>`,
      );
      return;
    }
    const unordered = /^[-*]\s+(.*)$/.exec(trimmed);
    if (unordered) {
      if (listType !== 'ul') {
        closeList();
        html.push('<ul class="my-1 list-disc space-y-1 pl-5">');
        listType = 'ul';
      }
      html.push(`<li>${inline(unordered[1])}</li>`);
      return;
    }
    const ordered = /^(\d+)[.)]\s+(.*)$/.exec(trimmed);
    if (ordered) {
      if (listType !== 'ol') {
        closeList();
        html.push('<ol class="my-1 list-decimal space-y-1 pl-5">');
        listType = 'ol';
      }
      html.push(`<li>${inline(ordered[2])}</li>`);
      return;
    }
    const quote = /^>\s?(.*)$/.exec(trimmed);
    if (quote) {
      closeList();
      html.push(
        `<blockquote class="my-2 border-l-4 border-border pl-3 italic opacity-80">${inline(quote[1])}</blockquote>`,
      );
      return;
    }
    closeList();
    html.push(`<p class="my-1 leading-relaxed">${inline(trimmed)}</p>`);
  });

  closeList();
  return html.join('');
}

export function plainTextPreview(source: string, limit = 160): string {
  const text = source
    .replace(/[#>*_~`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}
