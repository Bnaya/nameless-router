export interface ISimpleParams {
  [x: string]: string;
}

export interface IRouteController<TParams extends ISimpleParams> {
  setupNextLevel(
    p: TParams,
    extraz: Readonly<ILocationSubset>,
    willEnter: boolean,
    willPassthrough: boolean,
    abortSignal: IAbortSignalLike,
    linkHelper: ILinkHelper
  ): Promise<IRouteController<any>>;
  // * Should extrazChanged be async ???
  extrazChanged(e: Readonly<ILocationSubset>): void;
  passthrough(): void;
  enter(): void;
  // should be async with an ability to prevent navigation ???
  leave(): void;
  validateParams(p: any): p is TParams;
  invalidUrlHandler?(urlSegments: string[], segmentWithIssue: number): void;
}

export interface IInitialRouteController<TParams extends ISimpleParams>
  extends IRouteController<TParams> {
  invalidUrlHandler(urlSegments: string[], segmentWithIssue: number): void;
}

/**
 * numbers here are indexs on arrays containing the route controller and the corresponding segments
 */
export type INavigationPlan = Readonly<
  (
    | {
        reportExtrazChangedOnly: false;
        newSegments: string[];
        unchangedSegments: string[];
        reportExtrazChanged: boolean;
      }
    | {
        reportExtrazChangedOnly: true;
      }) & {
    locationSubset: Readonly<ILocationSubset>;
  }
>;

export type INavigationPlanHighLevel =
  | {
      controllersToLeave: Array<IRouteController<any>>;
      controllerToStartFrom: IRouteController<any>;
      relevantSegments: string[];
      unchangedControllers: Array<IRouteController<any>>;
      unchangedSegments: string[];
      reportExtrazChanged: boolean;
    }
  | {
      reportExtrazChangedOnly: boolean;
    };

export interface IRouterPrimitiveState {
  segments: string[];
  locationSubset: ILocationSubset;
}

export interface ILocationSubset {
  hash: string;
  pathname: string;
  search: string;
}

export interface IRouterState {
  primitive: IRouterPrimitiveState;
  controllers: Array<IRouteController<any>>;
}

export interface IAbortSignalLike {
  aborted: boolean;
  onabort(): void;
  addEventListener(event: "abort", handler: () => void): void;
  removeEventListener(event: "abort", handler: () => void): void;
  asPromise(): Promise<void>;
}

export interface ILinkHelper {
  /**
   * Generate url (path + querystring + hash) relative to the current url
   * calling generate(0, []) will return the current url
   * calling generate(1, []) will return one segment up url
   * calling generate(0, [{feature: category}]) will return the current url/category
   * calling generate(0, [{page: category}]) will return the current url/page--category
   * and so on...
   */
  generate(
    up?: number,
    add?: Array<ISimpleParams | string>,
    queryString?: string,
    hash?: string
  ): string;
  generateFromRoot(
    add: ISimpleParams[],
    queryString?: string,
    hash?: string
  ): string;
}

export interface IEventTargetLike<
  T extends string = string,
  E extends {
    type: T;
  } = {
    type: T;
  }
> {
  addEventListener(
    type: T,
    h: () => void
  ): {
    unsubscribe: () => void;
  };

  removeEventListener(type: T, h: () => void): void;

  dispatchEvent({ type }: E): void;
}

export interface INamelessRouter extends IEventTargetLike<"navigationEnd"> {
  navigate(l: ILocationSubset): Promise<void>;
  statusOfLocation(l: ILocationSubset): ILocationStatus;
}

export type ILocationStatus =
  | {
      enter: true;
      passthrough: false;
      extrazDifferent: boolean;
    }
  | {
      enter: false;
      passthrough: true;
      extrazDifferent: boolean;
    }
  | {
      enter: false;
      passthrough: false;
      extrazDifferent: boolean;
    };

// declare global {
//   // sad but needed
//   // tslint:disable:interface-name
//   // tslint:disable-next-line:no-empty-interface
//   interface URLSearchParams extends IterableIterator<string> {
//     entries(): IterableIterator<[string, string]>;
//     keys(): IterableIterator<string>;
//     values(): IterableIterator<string>;
//     toString(): string;
//   }
// }
