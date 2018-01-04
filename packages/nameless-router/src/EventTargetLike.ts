export class EventTargetLike<
  T extends string = string,
  E extends { type: T } = { type: T }
> {
  private handlers = new Map<T, Set<() => void>>();

  public addEventListener(type: T, h: () => void) {
    const hForE = this.handlers.get(type) || new Set<() => void>();
    hForE.add(h);
    this.handlers.set(type, hForE);

    return {
      unsubscribe: () => {
        this.removeEventListener(type, h);
      }
    };
  }

  public removeEventListener(type: T, h: () => void) {
    const hForE = this.handlers.get(type) || new Set<() => void>();
    hForE.delete(h);
    this.handlers.set(type, hForE);
  }

  public dispatchEvent({ type }: E) {
    const hs = this.handlers.get(type) || new Set<() => void>();

    hs.forEach(function(h) {
      Promise.resolve().then(h);
    });
  }
}
