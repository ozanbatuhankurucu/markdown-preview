export interface ScrollAnchor {
  sourceOffset: number;
  scrollOffset: number;
}

function createScrollAnchors(
  candidates: ScrollAnchor[],
  lineCount: number,
  maxScrollOffset: number,
): ScrollAnchor[] {
  const maxSourceOffset = Math.max(0, lineCount);
  const maxScroll = Math.max(0, maxScrollOffset);
  const groupedCandidates = new Map<number, number[]>();

  for (const candidate of candidates) {
    if (
      !Number.isFinite(candidate.sourceOffset) ||
      !Number.isFinite(candidate.scrollOffset)
    ) {
      continue;
    }

    const sourceOffset = Math.max(
      0,
      Math.min(candidate.sourceOffset, maxSourceOffset),
    );
    const offsets = groupedCandidates.get(sourceOffset) ?? [];
    offsets.push(Math.max(0, Math.min(candidate.scrollOffset, maxScroll)));
    groupedCandidates.set(sourceOffset, offsets);
  }

  const anchors = Array.from(groupedCandidates, ([sourceOffset, offsets]) => {
    offsets.sort((a, b) => a - b);
    return {
      sourceOffset,
      scrollOffset: offsets[Math.floor(offsets.length / 2)],
    };
  }).sort((a, b) => a.sourceOffset - b.sourceOffset);

  const monotonicAnchors: ScrollAnchor[] = [{ sourceOffset: 0, scrollOffset: 0 }];

  for (const anchor of anchors) {
    if (anchor.sourceOffset <= 0 || anchor.sourceOffset >= maxSourceOffset) {
      continue;
    }

    const previous = monotonicAnchors[monotonicAnchors.length - 1];
    if (anchor.scrollOffset >= previous.scrollOffset) {
      monotonicAnchors.push(anchor);
    }
  }

  if (maxSourceOffset > 0) {
    monotonicAnchors.push({
      sourceOffset: maxSourceOffset,
      scrollOffset: maxScroll,
    });
  }

  return monotonicAnchors;
}

function interpolate(
  anchors: ScrollAnchor[],
  value: number,
  input: keyof ScrollAnchor,
  output: keyof ScrollAnchor,
): number {
  if (anchors.length === 0) return 0;

  const boundedValue = Math.max(
    anchors[0][input],
    Math.min(value, anchors[anchors.length - 1][input]),
  );

  let low = 0;
  let high = anchors.length - 1;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (anchors[middle][input] <= boundedValue) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  const start = anchors[low];
  const end = anchors[Math.min(low + 1, anchors.length - 1)];
  const inputRange = end[input] - start[input];
  if (inputRange <= 0) return start[output];

  const progress = (boundedValue - start[input]) / inputRange;
  return start[output] + progress * (end[output] - start[output]);
}

export function getEditorScrollAnchors(
  editor: HTMLTextAreaElement,
  lineCount: number,
): ScrollAnchor[] {
  const mirror = editor.parentElement?.querySelector<HTMLElement>(
    "[data-editor-mirror]",
  );
  if (!mirror) {
    return createScrollAnchors([], lineCount, editor.scrollHeight - editor.clientHeight);
  }

  const paddingTop = parseFloat(getComputedStyle(mirror).paddingTop) || 0;
  const candidates = Array.from(
    mirror.querySelectorAll<HTMLElement>("[data-editor-line]"),
    (line) => ({
      sourceOffset: Number(line.dataset.editorLine) - 1,
      scrollOffset: line.offsetTop - paddingTop,
    }),
  );

  return createScrollAnchors(
    candidates,
    lineCount,
    editor.scrollHeight - editor.clientHeight,
  );
}

export function getPreviewScrollAnchors(
  preview: HTMLDivElement,
  lineCount: number,
): ScrollAnchor[] {
  const containerRect = preview.getBoundingClientRect();
  const paddingTop = parseFloat(getComputedStyle(preview).paddingTop) || 0;
  const currentScrollTop = preview.scrollTop;
  const candidates: ScrollAnchor[] = [];

  preview
    .querySelectorAll<HTMLElement>("[data-source-start][data-source-end]")
    .forEach((element) => {
      const sourceStart = Number(element.dataset.sourceStart);
      const sourceEnd = Number(element.dataset.sourceEnd);
      if (!sourceStart || !sourceEnd) return;

      const rect = element.getBoundingClientRect();
      candidates.push(
        {
          sourceOffset: sourceStart - 1,
          scrollOffset:
            currentScrollTop + rect.top - containerRect.top - paddingTop,
        },
        {
          sourceOffset: sourceEnd,
          scrollOffset:
            currentScrollTop + rect.bottom - containerRect.top - paddingTop,
        },
      );
    });

  return createScrollAnchors(
    candidates,
    lineCount,
    preview.scrollHeight - preview.clientHeight,
  );
}

export function getScrollOffsetForSource(
  anchors: ScrollAnchor[],
  sourceOffset: number,
): number {
  return interpolate(anchors, sourceOffset, "sourceOffset", "scrollOffset");
}

export function getSourceOffsetForScroll(
  anchors: ScrollAnchor[],
  scrollOffset: number,
): number {
  return interpolate(anchors, scrollOffset, "scrollOffset", "sourceOffset");
}
