import {
  IInitialRouteController,
  ILocationSubset,
  IRouteController
} from "./interfaces";

export class StackController
  implements IInitialRouteController<any>, IRouteController<any> {
  public invalidUrlSegments: null | string[];
  public segmentWithIssue: null | number;
  public enterAfterSegmentIndex: number | null = null;

  constructor(public stack: string[], public extraz: ILocationSubset) {}
  public setupNextLevel(p: any) {
    this.stack.push(p);

    return Promise.resolve(this);
  }

  public extrazChanged(e: ILocationSubset): void {
    this.extraz = e;
  }

  public enter(): void {
    this.enterAfterSegmentIndex = this.stack.length - 1;
  }

  public leave(): void {
    this.stack.pop();
  }

  public validateParams(p: any): p is any {
    return !!p;
  }

  public passthrough(): void {
    return;
  }

  public invalidUrlHandler(urlSegments: string[], segmentWithIssue: number) {
    this.invalidUrlSegments = urlSegments;
    this.segmentWithIssue = segmentWithIssue;
  }
}
