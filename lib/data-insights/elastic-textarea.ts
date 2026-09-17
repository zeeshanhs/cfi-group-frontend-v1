export type ElasticTextareaSize = {
  height: number;
  overflowing: boolean;
};

export function getElasticTextareaSize({
  scrollHeight,
  lineHeight,
  paddingBlock,
  borderBlock,
  maximumLines = 6,
}: {
  scrollHeight: number;
  lineHeight: number;
  paddingBlock: number;
  borderBlock: number;
  maximumLines?: number;
}): ElasticTextareaSize {
  const minimumHeight = lineHeight + paddingBlock + borderBlock;
  const maximumHeight = lineHeight * maximumLines + paddingBlock + borderBlock;
  const requestedHeight = scrollHeight + borderBlock;

  return {
    height: Math.max(minimumHeight, Math.min(requestedHeight, maximumHeight)),
    overflowing: requestedHeight > maximumHeight,
  };
}
