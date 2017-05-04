# batch-cluster

**Support external batch-mode tools within Node.js**

[![npm version](https://badge.fury.io/js/batch-cluster.svg)](https://badge.fury.io/js/batch-cluster)
[![Build status](https://travis-ci.org/mceachen/batch-cluster.js.svg?branch=master)](https://travis-ci.org/mceachen/batch-cluster.js)
[![Build status](https://ci.appveyor.com/api/projects/status/4564x6lvc8s6a55l/branch/master?svg=true)](https://ci.appveyor.com/project/mceachen/batch-cluster-js/branch/master)

Many command line tools, like ExifTool and GraphicsMagick, support running
arbitrary commands via a "batch mode," which amortizes process spin-up
costs over several, serial request/response pairs, sent via stdin/stdout.

Spinning up N of these child processes on multiprocessor machines gives you
parallelism.

Distributing requests to these processes, monitoring and restarting processes as
needed, and shutting them down appropriately, is what this module gives you.

This package powers
[exiftool-vendored](https://github.com/mceachen/exiftool-vendored.js).

## Changelog

### v1.0.0

* ✨ Integration tests now throw deterministically random errors to simulate
  flaky child procs, and ensure retries and disaster recovery work as expected.
* ✨ If the `processFactory` or `versionCommand` fails more often than a given
  rate, `BatchCluster` will shut down and raise exceptions to subsequent
  `enqueueTask` callers, rather than try forever to spin up processes that are
  most likely misconfigured.
* ✨ Given the proliferation of construction options, those options are now
  sanity-checked at construction time, and an error will be raised whose message
  contains all incorrect option values.

### v0.0.2

* ✨ Added support and explicit tests for [CR LF, CR, and
  LF](https://en.wikipedia.org/wiki/Newline) encoded streams from exec'ed
  processes
* ✨ child processes are ended after `maxProcAgeMillis`, and restarted as needed
* 🐞 `BatchCluster` now practices good listener hygene for `process.beforeExit`

### v0.0.1

* ✨ Extracted implementation and tests from
  [exiftool-vendored](https://github.com/mceachen/exiftool-vendored.js)

## Versioning

### The `MAJOR` or `API` version is incremented for

* 💔 Non-backwards-compatible API changes

### The `MINOR` or `UPDATE` version is incremented for

* ✨ Backwards-compatible features

### The `PATCH` version is incremented for

* 🐞 Backwards-compatible bug fixes
* 📦 Minor packaging changes
