import { EventTargetLike } from "./EventTargetLike";
import { NothingChangedException } from "./exceptions";
import {
  IInitialRouteController,
  ILocationSubset,
  INamelessRouter,
  IRouterState
} from "./interfaces";
import { applyNavigation, planNavigation } from "./navigation";
import { OurAbortController } from "./OurAbortController";
import { navigationRequestFromLocation, statusOfLocation } from "./utils";

export class NamelessRouter<
  TParams extends { [x: string]: string }
> extends EventTargetLike<"navigationEnd"> implements INamelessRouter {
  private state: IRouterState;
  private currentNavigation: Promise<{ aborted: boolean }> | null;
  private abortController: OurAbortController | null;
  private firstNavigation = true;

  constructor(private initialController: IInitialRouteController<TParams>) {
    super();
    this.state = {
      primitive: {
        locationSubset: {
          search: "",
          hash: "",
          pathname: ""
        },
        segments: []
      },
      controllers: []
    };
  }

  public async navigate(l: ILocationSubset) {
    if (this.currentNavigation && this.abortController) {
      this.abortController.abort();

      // wait the abort to take affect. ignore any errors.
      // the pre navigate will catch them, if any
      try {
        await this.currentNavigation;
      } catch (e) {
        //
      }
    }

    const plan = planNavigation(
      this.state.primitive,
      navigationRequestFromLocation(l)
    );
    this.abortController = new OurAbortController();

    let aborted = false;
    let error: Error | undefined;

    this.currentNavigation = applyNavigation(
      this.initialController,
      this.state,
      plan,
      this.abortController.signal
    );

    try {
      ({ aborted } = await this.currentNavigation);
    } catch (e) {
      if (!(this.firstNavigation && e instanceof NothingChangedException)) {
        error = e;
      }
    }

    this.firstNavigation = false;
    this.abortController = null;
    this.currentNavigation = null;

    if (error) {
      throw error;
    }
  }

  public statusOfLocation(l: ILocationSubset) {
    return statusOfLocation(l, this.state.primitive);
  }
}
