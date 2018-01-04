import { ConsumerErrorWrapper } from "../src/exceptions";
import {
  INavigationPlan,
  IRouterPrimitiveState,
  IRouterState
} from "../src/interfaces";
import { applyNavigation, planNavigation } from "../src/navigation";
import { OurAbortController } from "../src/OurAbortController";
import { defaultSegmentParser } from "../src/segmentParser";
import { StackController } from "../src/StackController";

describe("Navigation", function() {
  describe("test planNavigation", function() {
    test("Test initial navigation", function() {
      const committedState: IRouterPrimitiveState = {
        segments: [],
        hash: "",
        searchParams: ""
      };

      const navigationRequest: IRouterPrimitiveState = {
        segments: ["users", "permissions", "group"],
        hash: "",
        searchParams: ""
      };

      expect(planNavigation(committedState, navigationRequest)).toEqual({
        reportExtrazChanged: false,
        reportExtrazChangedOnly: false,
        newSegments: ["users", "permissions", "group"],
        unchangedSegments: [],
        hash: "",
        searchParams: ""
      });
    });

    test("Test back to / navigation", function() {
      const committedState: IRouterPrimitiveState = {
        segments: ["users", "permissions", "group"],
        hash: "",
        searchParams: ""
      };

      const navigationRequest: IRouterPrimitiveState = {
        segments: [],
        hash: "",
        searchParams: ""
      };

      expect(planNavigation(committedState, navigationRequest)).toEqual({
        reportExtrazChanged: false,
        reportExtrazChangedOnly: false,
        newSegments: [],
        unchangedSegments: [],
        hash: "",
        searchParams: ""
      });
    });

    test("Test navigation to sibling", function() {
      const committedState: IRouterPrimitiveState = {
        segments: ["users", "permissions"],
        hash: "",
        searchParams: ""
      };

      const navigationRequest: IRouterPrimitiveState = {
        segments: ["users", "friends"],
        hash: "",
        searchParams: ""
      };

      expect(planNavigation(committedState, navigationRequest)).toEqual({
        reportExtrazChanged: false,
        reportExtrazChangedOnly: false,
        newSegments: ["friends"],
        unchangedSegments: ["users"],
        hash: "",
        searchParams: ""
      });
    });

    test("Test navigation to nephew", function() {
      const committedState: IRouterPrimitiveState = {
        segments: ["users", "permissions"],
        hash: "",
        searchParams: ""
      };

      const navigationRequest: IRouterPrimitiveState = {
        segments: ["users", "friends", "team"],
        hash: "",
        searchParams: ""
      };

      expect(planNavigation(committedState, navigationRequest)).toEqual({
        reportExtrazChanged: false,
        reportExtrazChangedOnly: false,
        newSegments: ["friends", "team"],
        unchangedSegments: ["users"],
        hash: "",
        searchParams: ""
      });
    });

    test("Test navigation to uncle", function() {
      const committedState: IRouterPrimitiveState = {
        segments: ["users", "friends", "team"],
        hash: "",
        searchParams: ""
      };

      const navigationRequest: IRouterPrimitiveState = {
        segments: ["users", "permissions"],
        hash: "",
        searchParams: ""
      };

      expect(planNavigation(committedState, navigationRequest)).toEqual({
        reportExtrazChanged: false,
        reportExtrazChangedOnly: false,
        newSegments: ["permissions"],
        unchangedSegments: ["users"],
        hash: "",
        searchParams: ""
      });
    });

    // test("Nothing changed", function() {
    //   const committedState: IRouterPrimitiveState = {
    //     segments: [],
    //     hash: "",
    //     searchParams: "",
    //   };

    //   const navigationRequest: IRouterPrimitiveState = {
    //     segments: [],
    //     hash: "",
    //     searchParams: "",
    //   };

    //   expect(function() {
    //     planNavigation(committedState, navigationRequest);
    //   }).toThrowError(NothingChangedException);
    // });

    test("Test hash only changed", function() {
      const committedState: IRouterPrimitiveState = {
        segments: [],
        hash: "a",
        searchParams: ""
      };

      const navigationRequest: IRouterPrimitiveState = {
        segments: [],
        hash: "",
        searchParams: ""
      };
      expect(planNavigation(committedState, navigationRequest)).toEqual({
        reportExtrazChangedOnly: true,
        hash: "",
        searchParams: ""
      });
    });

    test("Test searchParams only changed", function() {
      const committedState: IRouterPrimitiveState = {
        segments: [],
        hash: "",
        searchParams: "a"
      };

      const navigationRequest: IRouterPrimitiveState = {
        segments: [],
        hash: "",
        searchParams: ""
      };
      expect(planNavigation(committedState, navigationRequest)).toEqual({
        reportExtrazChangedOnly: true,
        hash: "",
        searchParams: ""
      });
    });

    test("Test if extraz and segments changed, reportExtrazChangedOnly is not true", function() {
      const committedState: IRouterPrimitiveState = {
        segments: ["a"],
        hash: "a",
        searchParams: "a"
      };

      const navigationRequest: IRouterPrimitiveState = {
        segments: [],
        hash: "",
        searchParams: ""
      };

      expect(planNavigation(committedState, navigationRequest)).not.toContain({
        reportExtrazChangedOnly: true
      });
    });
  });

  describe("test applyNavigation", function() {
    test("Basic applyNavigation", async function() {
      const controller = new StackController([], {
        hash: "",
        searchParams: new URLSearchParams()
      });
      const state: IRouterState = {
        primitive: {
          segments: [],
          searchParams: "",
          hash: ""
        },
        controllers: []
      };

      const plan: INavigationPlan = {
        reportExtrazChanged: false,
        reportExtrazChangedOnly: false,
        newSegments: ["users", "permissions"],
        unchangedSegments: [],
        hash: "",
        searchParams: ""
      };

      const abortController = new OurAbortController();

      await applyNavigation(controller, state, plan, abortController.signal);

      const expectedState: IRouterState = {
        primitive: {
          segments: ["users", "permissions"],
          searchParams: "",
          hash: ""
        },
        controllers: []
      };

      expect(state.controllers.length).toBe(2);
      state.controllers.forEach(c => expect(c).toBeInstanceOf(StackController));
      state.controllers.forEach(c => expect(c).toBe(controller));

      expect(state.primitive).toEqual(expectedState.primitive);
      expect(controller.stack).toEqual(
        ["users", "permissions"].map(defaultSegmentParser)
      );
      expect(controller.enterAfterSegmentIndex).toBe(1);
    });

    test("applyNavigation with abort", async function() {
      const controller = new StackController([], {
        hash: "",
        searchParams: new URLSearchParams()
      });
      const state: IRouterState = {
        primitive: {
          segments: [],
          searchParams: "",
          hash: ""
        },
        controllers: []
      };

      const plan: INavigationPlan = {
        reportExtrazChanged: false,
        reportExtrazChangedOnly: false,
        newSegments: ["users", "permissions"],
        unchangedSegments: [],
        hash: "",
        searchParams: ""
      };

      const abortController = new OurAbortController();

      // this working becouse stackController is also using Promise.resolve()
      Promise.resolve().then(() => {
        abortController.abort();
      });

      await applyNavigation(controller, state, plan, abortController.signal);

      const expectedState: IRouterState = {
        primitive: {
          segments: ["users"],
          searchParams: "",
          hash: ""
        },
        controllers: []
      };

      expect(state.primitive).toEqual(expectedState.primitive);
      expect(controller.stack).toEqual(["users"].map(defaultSegmentParser));
      expect(controller.enterAfterSegmentIndex).toBe(0);
    });

    describe("ensure applyNavigation consumer helpers errors", function() {
      test("When error from setup(), should throw ConsumerErrorWrapper", async function() {
        const controller = new StackController([], {
          hash: "",
          searchParams: new URLSearchParams()
        });
        const state: IRouterState = {
          primitive: {
            segments: [],
            searchParams: "",
            hash: ""
          },
          controllers: []
        };

        const plan: INavigationPlan = {
          reportExtrazChanged: false,
          reportExtrazChangedOnly: false,
          newSegments: ["users", "permissions"],
          unchangedSegments: [],
          hash: "",
          searchParams: ""
        };

        const abortController = new OurAbortController();
        expect.assertions(2);

        const errorToRejectWith = new Error();
        controller.setupNextLevel = jest
          .fn()
          .mockImplementation(() => Promise.reject(errorToRejectWith));

        try {
          await applyNavigation(
            controller,
            state,
            plan,
            abortController.signal
          );
        } catch (e) {
          expect(e).toBeInstanceOf(ConsumerErrorWrapper);
          if (e instanceof ConsumerErrorWrapper) {
            expect(e.originalError).toBe(errorToRejectWith);
          }
        }
      });

      test("When error from enter, should throw ConsumerErrorWrapper", async function() {
        const controller = new StackController([], {
          hash: "",
          searchParams: new URLSearchParams()
        });
        const state: IRouterState = {
          primitive: {
            segments: [],
            searchParams: "",
            hash: ""
          },
          controllers: []
        };

        const plan: INavigationPlan = {
          reportExtrazChanged: false,
          reportExtrazChangedOnly: false,
          newSegments: ["users", "permissions"],
          unchangedSegments: [],
          hash: "",
          searchParams: ""
        };

        const abortController = new OurAbortController();
        expect.assertions(2);

        const errorToRejectWith = new Error();
        controller.enter = jest.fn().mockImplementation(() => {
          throw errorToRejectWith;
        });

        try {
          await applyNavigation(
            controller,
            state,
            plan,
            abortController.signal
          );
        } catch (e) {
          expect(e).toBeInstanceOf(ConsumerErrorWrapper);
          if (e instanceof ConsumerErrorWrapper) {
            expect(e.originalError).toBe(errorToRejectWith);
          }
        }
      });
    });
  });
});
