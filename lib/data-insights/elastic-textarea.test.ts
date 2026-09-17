import { describe, expect, it } from "vitest";

import { getElasticTextareaSize } from "./elastic-textarea";

describe("getElasticTextareaSize", () => {
  it("grows from one through six lines and then reports internal overflow", () => {
    const metrics = {
      lineHeight: 22,
      paddingBlock: 8,
      borderBlock: 0,
    };

    expect(
      getElasticTextareaSize({ ...metrics, scrollHeight: 30 }),
    ).toEqual({ height: 30, overflowing: false });
    expect(
      getElasticTextareaSize({ ...metrics, scrollHeight: 140 }),
    ).toEqual({ height: 140, overflowing: false });
    expect(
      getElasticTextareaSize({ ...metrics, scrollHeight: 162 }),
    ).toEqual({ height: 140, overflowing: true });
  });

  it("never collapses below one visual line", () => {
    expect(
      getElasticTextareaSize({
        scrollHeight: 0,
        lineHeight: 22,
        paddingBlock: 8,
        borderBlock: 2,
      }),
    ).toEqual({ height: 32, overflowing: false });
  });
});
