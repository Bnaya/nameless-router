import { EventTargetLike } from "./EventTargetLike";
import { IAbortSignalLike } from "./interfaces";

export class OurAbortSignal extends EventTargetLike<"abort">
  implements IAbortSignalLike {
  private isAborted = false;

  constructor() {
    super();
    const h = () => {
      this.onabort();
    };

    this.addEventListener("abort", h);
  }

  public get aborted() {
    return this.isAborted;
  }

  public onabort() {
    return;
  }

  public abort() {
    this.isAborted = true;
    super.dispatchEvent({ type: "abort" });
  }

  public asPromise() {
    return new Promise<void>(res => {
      const h = () => {
        this.removeEventListener("abort", h);
        res();
      };

      this.addEventListener("abort", h);
    });
  }
}
