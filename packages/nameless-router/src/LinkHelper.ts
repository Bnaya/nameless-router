import { ILinkHelper, ISimpleParams } from "./interfaces";
import { defaultSegmentSerializer } from "./segmentParser";

export class LinkHelper implements ILinkHelper {
  constructor(private segments: string[]) {}

  public generate(
    up: number = 0,
    add: Array<ISimpleParams | string> = [],
    queryString: string = "",
    hash: string = ""
  ): string {
    if (up > this.segments.length) {
      throw new Error("You can't go up more than the segments length");
    }

    const s = this.segments
      .slice(0, this.segments.length - up)
      .concat(add.map(defaultSegmentSerializer));
    let u = "/" + s.join("/");

    if (queryString.length > 0 && !queryString.startsWith("?")) {
      u += "?";
      u += queryString;
    }

    if (hash.length > 0 && !hash.startsWith("#")) {
      u += "#";
      u += hash;
    }

    return u;
  }

  public generateFromRoot(
    add: ISimpleParams[],
    queryString: string = "",
    hash: string = ""
  ) {
    const s = add.map(defaultSegmentSerializer);
    let u = "/" + s.join("/");

    if (queryString.length > 0 && !queryString.startsWith("?")) {
      u += "?";
      u += queryString;
    }

    if (hash.length > 0 && !hash.startsWith("#")) {
      u += "#";
      u += hash;
    }

    return u;
  }
}
