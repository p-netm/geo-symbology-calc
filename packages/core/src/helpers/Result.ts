// Error Codes:
export enum Sig {
  ABORT_EVALUATION = 'abort_evaluation'
}

/** This is a generic interface that describes the output (or ... Result) of
 * a function.
 *
 * A function can either return Success, or Failure.  The intention is to make
 * it clear that both Success and Failure must be considered and handled.
 *
 * Inspired by https://khalilstemmler.com/articles/enterprise-typescript-nodejs/handling-errors-result-class/
 */
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: string;
  public errorCode?: Sig;
  private _value: T;

  private constructor(isSuccess: boolean, error?: string, value?: T, sig?: Sig) {
    if (isSuccess && error) {
      throw new Error(`InvalidOperation: A result cannot be 
          successful and contain an error`);
    }
    if (!isSuccess && !error) {
      throw new Error(`InvalidOperation: A failing result 
          needs to contain an error message`);
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.error = error!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._value = value!;
    this.errorCode = sig;

    Object.freeze(this);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Cant retrieve the value from a failed result.`);
    }

    return this._value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string, code?: Sig): Result<U> {
    return new Result<U>(false, error, undefined, code);
  }
}
