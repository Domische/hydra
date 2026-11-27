import { beforeEach, describe, expect, it } from "vitest";
import { LocalStorageAdapter } from "../adapters/LocalStorageAdapter";

describe("LocalStorageAdapter", () => {
  const adapter = new LocalStorageAdapter();

  beforeEach(() => localStorage.clear());

  it("returns null when a key is absent", () => {
    expect(adapter.get("missing")).toBeNull();
  });

  it("returns a typed value that was stored", () => {
    adapter.set("sample", { id: 7, title: "Board" });

    expect(adapter.get<{ id: number; title: string }>("sample")).toEqual({
      id: 7,
      title: "Board",
    });
  });

  it("returns null instead of throwing for malformed JSON", () => {
    localStorage.setItem("broken", "{not-json");

    expect(adapter.get("broken")).toBeNull();
  });

  it("removes an existing key", () => {
    adapter.set("temporary", [1, 2, 3]);
    adapter.remove("temporary");

    expect(localStorage.getItem("temporary")).toBeNull();
  });

  it("serializes arrays and primitives", () => {
    adapter.set("numbers", [1, 2, 3]);
    adapter.set("active", true);

    expect(adapter.get<number[]>("numbers")).toEqual([1, 2, 3]);
    expect(adapter.get<boolean>("active")).toBe(true);
  });
});
