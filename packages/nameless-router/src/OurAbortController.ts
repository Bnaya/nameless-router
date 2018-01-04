import { IAbortSignalLike } from "./interfaces";
import { OurAbortSignal } from "./OurAbortSignal";

export class OurAbortController {
  public signal: IAbortSignalLike;
  private ourSignal = new OurAbortSignal();

  constructor() {
    this.signal = this.ourSignal;
  }

  public abort() {
    this.ourSignal.abort();
  }
}
