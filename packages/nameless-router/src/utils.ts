import {
  ILocationStatus,
  ILocationSubset,
  IRouterPrimitiveState
} from "./interfaces";

export function navigationRequestFromLocation(
  l: ILocationSubset
): IRouterPrimitiveState {
  return {
    // remove leading slash /
    segments: l.pathname === "/" ? [] : l.pathname.substring(1).split("/"),
    locationSubset: l
  };
}

export function warnConsumer(warning: string) {
  // @ts-ignore
  if (typeof console !== "undefined") {
    // @ts-ignore
    // tslint:disable-next-line:no-console
    console.warn(warning);
  }
}

export function statusOfLocation(
  l: ILocationSubset,
  s: IRouterPrimitiveState
): ILocationStatus {
  const extrazDifferent = searchAndHashCompare(l, s.locationSubset);

  if (s.segments.join("/").indexOf(l.pathname.substring(1)) === 0) {
    if (l.pathname.substring(1) === s.segments.join("/")) {
      return {
        enter: true,
        passthrough: false,
        extrazDifferent
      };
    }

    return {
      enter: false,
      passthrough: true,
      extrazDifferent
    };
  }

  return {
    enter: false,
    passthrough: false,
    extrazDifferent: false
  };
}

export function locationSubsetCompare(
  l1: ILocationSubset,
  l2: ILocationSubset
) {
  const propsToCompare: Array<keyof ILocationSubset> = [
    "hash",
    "pathname",
    "search"
  ];

  return propsToCompare.some(p => l1[p] !== l2[p]);
}

export function searchAndHashCompare(l1: ILocationSubset, l2: ILocationSubset) {
  const propsToCompare: Array<keyof ILocationSubset> = ["hash", "search"];

  return propsToCompare.some(p => l1[p] !== l2[p]);
}

export function locationStatusCompare(
  s1: ILocationStatus,
  s2: ILocationStatus
) {
  const propsToCompare: Array<keyof ILocationStatus> = [
    "enter",
    "passthrough",
    "extrazDifferent"
  ];

  return propsToCompare.some(p => s1[p] !== s2[p]);
}

export function urlFromLocationSubset(l: ILocationSubset) {
  return `${l.pathname}${l.search}${l.hash}`;
}
