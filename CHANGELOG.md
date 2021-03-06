# Changelog

## Versioning

See [Semver](http://semver.org/).

### The `MAJOR` or `API` version is incremented for

- 💔 Non-backwards-compatible API changes

### The `MINOR` or `UPDATE` version is incremented for

- ✨ Backwards-compatible features

### The `PATCH` version is incremented for

- 🐞 Backwards-compatible bug fixes
- 📦 Minor packaging changes

## v5.6.2

- 📦 Updated deps
- 📦 Removed trace and debug log calls in `BatchProcess` (which incurred GC overhead even when disabled)

## v5.6.1

- 📦 Expose `BatchCluster.options`. Note that the object is frozen at
  construction.

## v5.6.0

- 🐞/✨ `BatchProcess.end()` didn't correctly implement `gracefully` (which
  resulted in spurious `end(): called while not idle` errors), and allowed for
  multiple calls to destroy and disconnect from the child process, which may or
  may not have been ill-advised.

## v5.5.0

- ✨ Added `BatchCluster.isIdle`. Updated deps. Deflaked CI by embiggening
- ✨ Added `BatchClusterOptions.cleanupChildProcs`, in case you want to handle
  process cleanup yourself.
- 📦 Updated deps. Deflaked CI by embiggening timeouts.
- Happy 🥧 day.

## v5.4.0

- ✨ "wear-leveling" for processes. Previously, only the first-spawned child
  process would service most task requests, but that caused issues with (very)
  long-running tasks where the other child processes would be spooled off ram,
  and could time out when requested later.
- 🐞 `maxProcs` is respected again. In prior builds, if tasks were enqueued all
  at once, prior dispatch code would only spin 1 concurrent task at a time.
- 🐞 Multiple calls to `BatchProcess.end` would result in different promise
  resolution targets: the second call to `.end()` would resolve before the
  first. This was fixed.
- ✨
  [BatchProcessOptions](https://batch-cluster.js.org/classes/batchclusteroptions.html)'s
  `minDelayBetweenSpawnMillis` was added, to help relieve undue system load on
  startup. It defaults to 1.5 seconds and can be disabled by setting it to 0.

## v5.3.1

- 📦 Removed `Deferred`'s warn log messages.

## v5.3.0

- 🐞 `.pass` and `.fail` regex now support multiple line outputs per task.

## v5.2.0

- 🐞 [BatchProcessOptions](https://batch-cluster.js.org/classes/batchclusteroptions.html)`.pass`
  and `.fail` had poorly specified and implemented failure semantics. Prior
  implementations would capture a "failed" string, but not tell the task that
  the service returned a failure status.

  Task [Parser](https://batch-cluster.js.org/interfaces/parser.html)s already
  accept stdout and stderr, and are the "final word" in resolving or rejecting
  [Task](https://batch-cluster.js.org/classes/task.html)s.

  `v5.2.0` provides a boolean to Parser's callable indicating if the wrapped
  service returned pass or fail, and the Parser may return a Promise now, as
  well.

  There's a new `SimpleParser` implementation you can use that fails if `stderr` is non-blank or a stream matched the `.fail` pattern.

- 🐞 initial `BatchProcess` validation uses the new `SimpleParser` to verify the
  initial `versionCommand`.

- ✨ child process pids are delivered to event listeners on spawn and close. See
  [BatchClusterEmitter](https://batch-cluster.js.org/classes/batchclusteremitter.html).

- 🐞 fix "Error: end() called when not idle" by debouncing stdout and stderr
  readers. Note that this adds latency to every task. See
  [BatchProcessOptions](https://batch-cluster.js.org/classes/batchclusteroptions.html)'s
  `streamFlushMillis` option, which defaults to 10 milliseconds.

- 🐞 RegExp for pass and fail tokens handle newline edge cases now.

- 📦 re-added tslint and delinted code.

## v5.1.0

- ✨ `ChildProcessFactory` supports thunks that return either a `ChildProcess` or
  `Promise<ChildProcess>`
- 📦 Update deps

## v5.0.1

- 📦 Update deps
- 📦 re-run prettier

## v5.0.0

- 💔 The `rejectTaskOnStderr` API, which was added in v4.1.0 and applied to all
  tasks for a given `BatchCluster` instance, proved to be a poor decision, and
  has been removed. The `Parser` API, which is task-specific, now receives
  **both** stdin and stderr streams. Parsers then have the necessary context to
  decide what to do on a per task or per task-type basis.
- 🐞 In previous versions, batch processes were recycled if any task had any
  type of error. This version allows pids to live even if they emit data to
  stderr.

## v4.3.0

- ✨ If your tasks return interim progress and you want to capture that data
  as it happens, BatchCluster now emits `taskData` events with the data and the
  current task (which may be undefined) as soon as the stream data is emitted.
- 📦 Pulled in latest dependency versions

## v4.2.0

- 📦 In the interests of less noise, the default logger is now the `NoLogger`.
  Consumers may use the `ConsoleLogger` or another `Logger` implementation as
  they see fit.

## v4.1.0

- ✨ Support for demoting task errors from `stderr` emissions:
  `BatchProcess.rejectTaskOnStderr` is a per-task, per-error predicate which
  allows for a given error to be handled without always rejecting the task. This
  can be handy if the script you're wrapping (like ExifTool) writes non-fatal
  warnings to stderr.
- ✨ `BatchProcessOptions.pass` and `BatchProcessOptions.fail` can be RegExp
  instances now, if you have more exotic parsing needs.

## v4.0.0

- 💔 Using Node 8+ to determine if a process is running with `kill(pid, 0)`
  turns out to be unreliable (as it returns true even after the process exits).
  I tried to pull in the best-maintained "process-exists" external dependency,
  but that pulled in 15 more modules (this used to be a zero-deps module), and
  it was extremely unperformant on Windows.

  The TL;DR: is that `running(pid)` now returns a `Promise<boolean>`, which had
  far-reaching signature changes to accomodate the new asynchronicity, hence the
  major version bump.

- 💔 In an effort to reduce this library's complexity, I'm removing retry
  functionality. All parameters associated to retries are now gone.

- ✨ Internal state validation is now exposed by BatchCluster, and is used by
  tests to ensure no internal errors happen during integration tests. Previously
  these errors were simply logged.

## v3.2.0

- 📦 New `Logger` methods, `withLevels`, `withTimestamps`, and `filterLevels`
  were shoved into a new `Logger` namespace.

## v3.1.0

- ✨ Added simple timestamp and levels logger prefixer for tests
- 🐞 Errors rethrown via BatchProcess now strip extraneous `Error:` prefixes
- 🐞 For a couple internal errors (versionCommend startup errors and internal
  state inconsistencies on `onExit` that aren't fatal), we now log `.error`
  rather than throw Error() or ignore.

## v3.0.0

- ✨/💔 **`Task` promises are only rejected with `Error` instances now.** Note
  that also means that `BatchProcessObserver` types are more strict. It could be
  argued that this isn't an API breaking change as it only makes rejection
  values more strict, but people may need to change their error handling, so I'm
  bumping the major version to highlight that. Resolves
  [#3](https://github.com/mceachen/batch-cluster.js/issues/3). Thanks for the
  issue, [Nils Knappmeier](https://github.com/nknapp)!

## v2.2.0

- 🐞 Windows taskkill `/PID` option seemed to work downcased, but the docs say
  to use uppercase, so I've updated it.
- 📦 Upgrade all deps including TypeScript to 2.9

(v2.1.2 is the same contents, but `np` had a crashbug during publish)

## v2.1.1

- 📦 More robust `end` for `BatchProcess`, which may prevent very long-lived
  consumers from sporadically leaking child processes on Mac and linux.
- 📦 Added Node 10 to the build matrix.

## v2.1.0

- 📦 Introduced `Logger.trace` and moved logging related to per-task items down
  to `trace`, as heavy load and large request or response payloads could
  overwhelm loggers. If you really want to see on-the-wire requests and results,
  enable `trace` in your debugger implementation. By default, the
  `ConsoleLogger` omits log messages with this level.

## v2.0.0

- 💔 Replaced `BatchClusterObserver` with a simple EventEmitter API on
  `BatchCluster` to be more idiomatic with node's API
- 💔 v1.11.0 added "process reuse" after errors, but that turned out to be
  problematic in recovery, so that change was reverted (and with it, the
  `maxTaskErrorsPerProcess` parameter was removed)
- ✨ `Rate` is simpler and more accurate now.

## v1.11.0

- ✨ Added new `BatchClusterObserver` for error and lifecycle monitoring
- 📦 Added a number of additional logging calls

## v1.10.0

- 🐞 Explicitly use `timers.setInterval`. May address [this
  issue](https://stackoverflow.com/questions/48961238/electron-setinterval-implementation-difference-between-chrome-and-node).
  Thanks for the PR, [Tim Fish](https://github.com/timfish)!

## v1.9.1

- 📦 Changed `BatchProcess.end()` to use `until()` rather than `Promise.race`,
  and always use `kill(pid, forced)` after waiting the shutdown grace period
  to prevent child process leaks.

## v1.9.0

- ✨ New `Logger.setLogger()` for debug, info, warning, and errors. `debug` and
  `info` defaults to Node's
  [debuglog](https://nodejs.org/api/util.html#util_util_debuglog_section),
  `warn` and `error` default to `console.warn` and `console.error`,
  respectively.
- 📦 docs generated by [typedoc](http://typedoc.org/)
- 📦 Upgraded dependencies (including TypeScript 2.7, which has more strict
  verifications)
- 📦 Removed tslint, as `tsc` provides good lint coverage now
- 📦 The code is now [prettier](https://github.com/prettier/prettier)
- 🐞 `delay` now allows
  [unref](https://nodejs.org/api/timers.html#timers_timeout_unref)ing the
  timer, which, in certain circumstances, could prevent node processes from
  exiting gracefully until their timeouts expired

## v1.8.0

- ✨ onIdle now runs as many tasks as it can, rather than just one. This should
  provide higher throughput.
- 🐞 Removed stderr emit on race condition between onIdle and execTask. The
  error condition was already handled appropriately--no need to console.error.

## v1.7.0

- 📦 Exported `kill()` and `running()` from `BatchProcess`

## v1.6.1

- 📦 De-flaked some tests on mac, and added Node 8 to the build matrix.

## v1.6.0

- ✨ Processes are forcefully shut down with `taskkill` on windows and `kill -9`
  on other unix-like platforms if they don't terminate after sending the
  `exitCommand`, closing `stdin`, and sending the proc a `SIGTERM`. Added a test
  harness to exercise.
- 📦 Upgrade to TypeScript 2.6.1
- 🐞 `mocha` tests don't require the `--exit` hack anymore 🎉

## v1.5.0

- ✨ `.running()` works correctly for PIDs with different owners now.
- 📦 `yarn upgrade --latest`

## v1.4.2

- 📦 Ran code through `prettier` and delinted
- 📦 Massaged test assertions to pass through slower CI systems

## v1.4.1

- 📦 Replaced an errant `console.log` with a call to `log`.

## v1.4.0

- 🐞 Discovered `maxProcs` wasn't always utilized by `onIdle`, which meant in
  certain circumstances, only 1 child process would be servicing pending
  requests. Added breaking tests and fixed impl.

## v1.3.0

- 📦 Added tests to verify that the `kill(0)` calls to verify the child
  processes are still running work across different node version and OSes
- 📦 Removed unused methods in `BatchProcess` (whose API should not be accessed
  directly by consumers, so the major version remains at 1)
- 📦 Switched to yarn and upgraded dependencies

## v1.2.0

- ✨ Added a configurable cleanup signal to ensure child processes shut down on
  `.end()`
- 📦 Moved child process management from `BatchCluster` to `BatchProcess`
- ✨ More test coverage around batch process concurrency, reuse, flaky task
  retries, and proper process shutdown

## v1.1.0

- ✨ `BatchCluster` now has a force-shutdown `exit` handler to accompany the
  graceful-shutdown `beforeExit` handler. For reference, from the
  [Node docs](https://nodejs.org/api/process.html#process_event_beforeexit):

> The 'beforeExit' event is not emitted for conditions causing explicit
> termination, such as calling process.exit() or uncaught exceptions.

- ✨ Remove `Rate`'s time decay in the interests of simplicity

## v1.0.0

- ✨ Integration tests now throw deterministically random errors to simulate
  flaky child procs, and ensure retries and disaster recovery work as expected.
- ✨ If the `processFactory` or `versionCommand` fails more often than a given
  rate, `BatchCluster` will shut down and raise exceptions to subsequent
  `enqueueTask` callers, rather than try forever to spin up processes that are
  most likely misconfigured.
- ✨ Given the proliferation of construction options, those options are now
  sanity-checked at construction time, and an error will be raised whose message
  contains all incorrect option values.

## v0.0.2

- ✨ Added support and explicit tests for
  [CR LF, CR, and LF](https://en.wikipedia.org/wiki/Newline) encoded streams
  from spawned processes
- ✨ child processes are ended after `maxProcAgeMillis`, and restarted as needed
- 🐞 `BatchCluster` now practices good listener hygene for `process.beforeExit`

## v0.0.1

- ✨ Extracted implementation and tests from
  [exiftool-vendored](https://github.com/mceachen/exiftool-vendored.js)
