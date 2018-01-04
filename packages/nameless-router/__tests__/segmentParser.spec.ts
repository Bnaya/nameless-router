import {
  defaultSegmentParser,
  defaultSegmentSerializer
} from "../src/segmentParser";

describe("test segment parser/serialize", function() {
  test("defaultSegmentParser", function() {
    expect(defaultSegmentParser("")).toEqual({});
    expect(defaultSegmentParser("foo")).toEqual({ feature: "foo" });
    expect(defaultSegmentParser("foo--bar")).toEqual({ foo: "bar" });
    expect(defaultSegmentParser("foo--bar..anotherkey--anothervalue")).toEqual({
      foo: "bar",
      anotherkey: "anothervalue"
    });

    // // failing test becouse no escaping of special chars(.)
    // expect(defaultSegmentParser("foo!bar.anotherkey!another.value")).toEqual({
    //   foo: "bar",
    //   anotherkey: "anothervalue",
    // });

    // // failing test becouse no escaping of special chars(!)
    // expect(defaultSegmentParser("foo!bar.anotherkey!another!value")).toEqual({
    //   foo: "bar",
    //   anotherkey: "anothervalue",
    // });
  });

  test("defaultSegmentSerializer", function() {
    expect(defaultSegmentSerializer({})).toBe("");
    expect(defaultSegmentSerializer({ a: "1", b: "2" })).toBe("a--1..b--2");
  });
});
