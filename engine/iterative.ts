/**
 * Generic helper for visualizing iterative mathematical processes.
 *
 * Examples:
 * - Split closure:
 *      P0 -> P1 -> P2 -> ...
 *
 * - Simplex:
 *      x0 -> x1 -> x2 -> ...
 *
 * - Branch and Bound:
 *      Tree0 -> Tree1 -> Tree2
 */

export type IterationStep<T> = {
  iteration: number;
  title: string;
  description: string;
  state: T;
};


export function createIterations<T>(
  count: number,
  generator: (iteration: number) => IterationStep<T>
): IterationStep<T>[] {
  return Array.from(
    { length: count },
    (_, i) => generator(i)
  );
}


/**
 * Represents processes that can continue indefinitely.
 *
 * Useful for examples where:
 *
 * P0 ⊃ P1 ⊃ P2 ⊃ ...
 *
 * but no finite iteration reaches the limit.
 */
export function createInfiniteProcess<T>(
  generator: (iteration: number) => T
) {
  return {
    getState(iteration: number): T {
      return generator(iteration);
    },
  };
}