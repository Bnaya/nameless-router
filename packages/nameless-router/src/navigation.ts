import {
  ConsumerErrorWrapper,
  // NothingChangedException,
  StopNavigationException,
  TypeScriptTypeSafetyError
} from "./exceptions";
import {
  IAbortSignalLike,
  IInitialRouteController,
  INavigationPlan,
  IRouteController,
  IRouterPrimitiveState,
  IRouterState
} from "./interfaces";
import { LinkHelper } from "./LinkHelper";
import { defaultSegmentParser } from "./segmentParser";
import { warnConsumer } from "./utils";

export function planNavigation(
  prevCommittedState: IRouterPrimitiveState,
  stateToBe: IRouterPrimitiveState
): INavigationPlan {
  const reportExtrazChanged =
    prevCommittedState.locationSubset.hash !== stateToBe.locationSubset.hash ||
    prevCommittedState.locationSubset.search !==
      stateToBe.locationSubset.search;

  if (stateToBe.segments.join("") === prevCommittedState.segments.join("")) {
    if (reportExtrazChanged) {
      return {
        reportExtrazChangedOnly: true,
        locationSubset: stateToBe.locationSubset
      };
    }

    // nothing nothing changed
    return {
      reportExtrazChangedOnly: false,
      reportExtrazChanged: false,
      locationSubset: stateToBe.locationSubset,
      newSegments: [],
      unchangedSegments: prevCommittedState.segments
    };
  }

  const mightBeDiffPoint = prevCommittedState.segments.findIndex(
    (s, i) => s !== stateToBe.segments[i]
  );

  const diffPoint =
    mightBeDiffPoint === -1 &&
    stateToBe.segments.length > prevCommittedState.segments.length
      ? // We just have new segments
        prevCommittedState.segments.length
      : // completely diffrent
        mightBeDiffPoint;

  const newSegments =
    diffPoint > -1 ? stateToBe.segments.slice(diffPoint) : stateToBe.segments;
  const unchangedSegments =
    diffPoint > -1 ? stateToBe.segments.slice(0, diffPoint) : [];

  return {
    reportExtrazChangedOnly: false,
    reportExtrazChanged,
    locationSubset: stateToBe.locationSubset,
    newSegments,
    unchangedSegments
  };
}

/**
 * Apply our navigation plan on the given router state, mutate it to the new state.
 * The plan not necessarily be completed, if there's any error (eg one of the setup rejected), or the stopToken set to true,
 * the state will be in the place we got to
 *
 * Should extrazChanged be async ???
 *
 * @param initialController
 * @param routerState
 * @param plan
 * @param stopToken
 *
 * should we return navigation report?
 */
export async function applyNavigation<TParams extends { [x: string]: string }>(
  initialController: IInitialRouteController<TParams>,
  routerState: IRouterState,
  plan: INavigationPlan,
  abortSignal: IAbortSignalLike
) {
  if (plan.reportExtrazChangedOnly) {
    initialController.extrazChanged(plan.locationSubset);
    routerState.controllers.forEach(cc =>
      cc.extrazChanged(plan.locationSubset)
    );

    routerState.primitive.locationSubset = plan.locationSubset;
    return { aborted: false };
  }

  // do we have controllers that we need to `leave`? find out and leave them
  const toLeave =
    routerState.primitive.segments.length - plan.unchangedSegments.length;
  // toLeave might be 0, so this loop won't run. which ok
  // end-to-start, remove controller and the segment that created him
  // report leave on that controller
  for (let i = 0; i < toLeave; i++) {
    const controllerToLeave = routerState.controllers.pop();
    routerState.primitive.segments.pop();

    if (!controllerToLeave) {
      throw new TypeScriptTypeSafetyError();
    }

    try {
      controllerToLeave.leave();
    } catch (e) {
      throw new ConsumerErrorWrapper(e);
    }
  }

  // this is here becouse we don't want to report about the changed extraz to the controllers we need to leave
  // on that navigation
  initialController.extrazChanged(plan.locationSubset);
  routerState.controllers.forEach(cc => cc.extrazChanged(plan.locationSubset));
  routerState.primitive.locationSubset = { ...plan.locationSubset };

  let controllerToActOn =
    routerState.controllers.length === 0
      ? initialController
      : routerState.controllers[routerState.controllers.length - 1];

  const first = controllerToActOn;

  const controllersNavigated: Array<IRouteController<any>> = [];
  const segmentsNavigated: string[] = [];

  // for es5 support i can't use this and typescript.
  // see https://github.com/Microsoft/TypeScript/issues/6842
  // for (const [i, urlSegment] of plan.newSegments.entries()) {
  for (let i = 0; i < plan.newSegments.length; i++) {
    const urlSegment = plan.newSegments[i];
    let paramsFailedToParse = false;
    let params: any = {};

    try {
      params = defaultSegmentParser(urlSegment);
    } catch (e) {
      paramsFailedToParse = true;
    }

    // gracefully handle when we fail to parse the params from any segment
    // report the failure to the invalidUrlHandler on the controller or the initial controller
    if (paramsFailedToParse || !controllerToActOn.validateParams(params)) {
      // maybe we need to substract 1?
      const segmentWithIssueIndex = i + plan.unchangedSegments.length;
      const allSegments = plan.unchangedSegments.concat(plan.newSegments);

      // maybe traverse up the controllers stack and not fallback directly to initialController?
      if (controllerToActOn.invalidUrlHandler) {
        controllerToActOn.invalidUrlHandler(allSegments, segmentWithIssueIndex);
      } else {
        initialController.invalidUrlHandler(allSegments, segmentWithIssueIndex);
      }

      break;
    }

    const isLast = i === plan.newSegments.length - 1;
    let aborted = false;
    let stopped = false;
    try {
      const linkHelper = new LinkHelper(
        routerState.primitive.segments.concat(plan.newSegments.slice(0, i + 1))
      );
      controllerToActOn = await controllerToActOn.setupNextLevel(
        params,
        plan.locationSubset,
        isLast,
        !isLast,
        abortSignal,
        linkHelper
      );
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") {
          aborted = true;
        } else if (e instanceof StopNavigationException) {
          stopped = true;
        } else {
          // should we report the error on a handle on the controller?
          /// like: controllerToActOn.setupFailed(params), and if needed go to the initialController?
          // or maybe setup should not fail, but the consumer need to handle errors by itself?
          throw new ConsumerErrorWrapper(e);
        }
      }
    }

    // if the navigation was aborted while we are during the setup async phase,
    // setup should respect the abortSignal and abort itself, returning AbortError
    // stop where we are
    if (aborted || stopped) {
      break;
    }

    controllersNavigated.push(controllerToActOn);
    segmentsNavigated.push(urlSegment);

    if (abortSignal.aborted) {
      // if we got here, it means the last setup call didn't respect our abortSignal! :O
      // So we will make a gracefull abort and warn the consumer about it
      warnConsumer(
        "Last setup call didn't respect the AbortSignal. falling back to gracefull abort"
      );
      break;
    }
  }

  try {
    first.passthrough();
    controllersNavigated
      .slice(0, controllersNavigated.length - 1)
      .forEach(function(c) {
        c.passthrough();
      });
    controllerToActOn.enter();
  } catch (e) {
    throw new ConsumerErrorWrapper(e);
  }

  routerState.controllers.push(...controllersNavigated);
  routerState.primitive.segments.push(...segmentsNavigated);

  return { aborted: abortSignal.aborted };
}
