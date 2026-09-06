/**
 * kernel/command-queue.ts — FIFO command queue
 *
 * Commands flow inward from Vue/UI and Pixi/input into the ECS.
 * The queue is drained at the start of every game-loop tick (COMMAND_DRAIN phase).
 *
 * Pause semantics:
 *        - `pause()`   sets blocked flag only. Queue is NOT cleared.
 *        - while blocked, `push(cmd)` drops gameplay commands (by type check)
 *         but still enqueues control commands.
 *        - `resume()`  unblocks all pushes.
 *
 * Control types are passed at creation time as a `Set<string>`.
 * Command `type` fields are checked against this set when the queue is paused.
 */

export interface CommandQueue<TCommands> {
   /** Push a command. Drops gameplay commands when paused; control commands always accepted. */
  push: (cmd: TCommands[keyof TCommands]) => void;
   /** Drain all pending commands in FIFO order. Called once per tick by COMMAND_DRAIN. */
  drain: (handler: (cmd: TCommands[keyof TCommands]) => void) => void;
   /** Number of commands currently in the queue. */
  readonly pending: number;
   /** Whether the queue is currently paused. */
  readonly paused: boolean;
   /** Pause: block gameplay commands. Queue is NOT cleared. */
  pause: () => void;
   /** Resume: unblock all commands. */
  resume: () => void;
   /** Clear all pending commands without pausing. */
  clear: () => void;
   /** Tear down the queue. */
  destroy: () => void;
}

/**
 * Create a typed command queue.
 *
 * @param controlTypes - set of command `type` strings that are accepted even when paused.
 *       Defaults to empty (all commands blocked on pause).
 */
export function createCommandQueue<TCommands>(
   controlTypes?: Set<string>,
): CommandQueue<TCommands> {
  const isControl = controlTypes ?? new Set<string>();
  let queue: Array<TCommands[keyof TCommands]> = [];
  let paused = false;

  function push(cmd: TCommands[keyof TCommands]): void {
    if (paused) {
        // Only control commands pass through when paused.
      const type = (cmd as { type?: string }).type;
      if (type !== undefined && isControl.has(type)) {
        queue.push(cmd);
        } else {
        return;
        }
    } else {
    queue.push(cmd);
    }
   }

  function drain(handler: (cmd: TCommands[keyof TCommands]) => void): void {
    if (queue.length === 0) return;
    const batch = queue;
    queue = [];
    for (let i = 0; i < batch.length; i++) {
      handler(batch[i]!);
      }
    }

  function pause(): void {
    paused = true;
    }

  function resume(): void {
    paused = false;
    }

  function clear(): void {
    queue = [];
    }

  function destroy(): void {
    queue = [];
    paused = false;
    }

  return {
    push,
    drain,
    get pending() {
      return queue.length;
      },
    get paused() {
      return paused;
      },
    pause,
    resume,
    clear,
    destroy,
    };
}
