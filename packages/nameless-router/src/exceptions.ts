export class RouterError extends Error {}

export class NothingChangedException extends RouterError {}
export class TypeScriptTypeSafetyError extends RouterError {}

export class ConsumerErrorWrapper extends RouterError {
  constructor(public originalError: Error) {
    super(
      "Your code had an unexpected exception. that means broken router and app state. the router can't recover from " +
        "it.  see error.originalError for the original error that was thrown"
    );
  }
}

export class StopNavigationException extends RouterError {}
