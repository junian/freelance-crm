import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("ignores falsy values", () => {
    expect(cn("text-sm", false && "hidden", undefined, null)).toBe("text-sm");
    expect(cn({ "font-bold": true, "text-red-500": false })).toBe("font-bold");
  });

  it("resolves conflicting Tailwind classes with the last one winning", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });
});
