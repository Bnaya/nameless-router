import {
  ILocationSubset,
  IRouterPrimitiveState,
  ILocationStatus
} from "../src/interfaces";
import { navigationRequestFromLocation, statusOfLocation } from "../src/utils";

describe("test utils", function() {
  describe("test navigationRequestFromLocation", function() {
    test("test", function() {
      const l: ILocationSubset = {
        hash: "#asd",
        pathname: "/products",
        search: "?foo=bar"
      };

      const expected: IRouterPrimitiveState = {
        segments: ["products"],
        hash: "asd",
        searchParams: "foo=bar"
      };

      expect(navigationRequestFromLocation(l)).toEqual(expected);
    });

    test("trailing slash means new segment", function() {
      const l: ILocationSubset = {
        hash: "#asd",
        pathname: "/products/",
        search: "?foo=bar"
      };

      const expected: IRouterPrimitiveState = {
        segments: ["products", ""],
        hash: "asd",
        searchParams: "foo=bar"
      };

      expect(navigationRequestFromLocation(l)).toEqual(expected);
    });

    test("Test statusOfLocation enter & extrazDifferent", function() {
      const state: IRouterPrimitiveState = {
        segments: ["products"],
        hash: "asd",
        searchParams: "foo=bar"
      };

      const l: ILocationSubset = {
        hash: "#asd",
        pathname: "/products",
        search: "?foo=foo"
      };

      const expected: ILocationStatus = {
        enter: true,
        passthrough: false,
        extrazDifferent: true
      };

      expect(statusOfLocation(l, state)).toEqual(expected);
    });

    test("Test statusOfLocation passthrough", function() {
      const state: IRouterPrimitiveState = {
        segments: ["products", "assoc"],
        hash: "asd",
        searchParams: "foo=bar"
      };

      const l: ILocationSubset = {
        hash: "#asd",
        pathname: "/products",
        search: "?foo=bar"
      };

      const expected: ILocationStatus = {
        enter: false,
        passthrough: true,
        extrazDifferent: false
      };

      expect(statusOfLocation(l, state)).toEqual(expected);
    });

    test("Test statusOfLocation none", function() {
      const state: IRouterPrimitiveState = {
        segments: [],
        hash: "",
        searchParams: "foo=bar"
      };

      const l: ILocationSubset = {
        hash: "",
        pathname: "/products",
        search: ""
      };

      const expected: ILocationStatus = {
        enter: false,
        passthrough: false,
        extrazDifferent: false
      };

      expect(statusOfLocation(l, state)).toEqual(expected);
    });
  });
});
