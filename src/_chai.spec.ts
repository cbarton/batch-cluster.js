import { ChildProcess, spawn } from "child_process"
import { join } from "path"
import * as _p from "process"

import { Logger, logger, setLogger } from "./Logger"
import { orElse } from "./Object"
import { Parser } from "./Parser"
import { pids } from "./Pids"
import { notBlank } from "./String"

export const mocha = require("mocha")

const _chai = require("chai")
_chai.use(require("chai-string"))
_chai.use(require("chai-as-promised"))
_chai.use(require("chai-withintoleranceof"))

export { expect } from "chai"

// Tests should be quiet unless LOG is set
setLogger(
  Logger.withLevels(
    Logger.withTimestamps(
      Logger.filterLevels(
        {
          // tslint:disable: no-unbound-method
          trace: console.log,
          debug: console.log,
          info: console.log,
          warn: console.warn,
          error: console.error
        },
        orElse(_p.env.LOG as any, "error")
      )
    )
  )
)

export const parserErrors: string[] = []

beforeEach(() => (parserErrors.length = 0))

export const parser: Parser<string> = (
  stdout: string,
  stderr: string | undefined,
  passed: boolean
) => {
  if (stderr != null) {
    parserErrors.push(stderr)
  }
  if (!passed || notBlank(stderr)) {
    logger().debug("test parser: rejecting task", {
      stdout,
      stderr,
      passed
    })
    throw new Error(stderr)
  } else {
    const str = stdout
      .split(/(\r?\n)+/)
      .filter(ea => notBlank(ea) && !ea.startsWith("# "))
      .join("\n")
      .trim()
    logger().debug("test parser: resolving task", str)
    return str
  }
}

process.on("unhandledRejection", (reason: any) => {
  console.error("unhandledRejection:", reason.stack || reason)
})

export function times<T>(n: number, f: (idx: number) => T): T[] {
  return Array(n)
    .fill(undefined)
    .map((_, i) => f(i))
}

// because @types/chai-withintoleranceof isn't a thing (yet)

type WithinTolerance = (
  expected: number,
  tol: number | number[],
  message?: string
) => Chai.Assertion

declare namespace Chai {
  interface Assertion {
    withinToleranceOf: WithinTolerance
    withinTolOf: WithinTolerance
  }
}

export const procs: ChildProcess[] = []

export function testPids(): number[] {
  return procs.map(proc => proc.pid)
}

export async function currentTestPids(): Promise<number[]> {
  const alivePids = new Set(await pids())
  return procs.map(ea => ea.pid).filter(ea => alivePids.has(ea))
}

// Seeding the RNG deterministically _should_ give us repeatable
// flakiness/successes.

// We want a rngseed that is stable for consecutive tests, but changes sometimes
// to make sure different error pathways are exercised. YYYY-MM-$callcount
// should do it.

const rngseedPrefix = new Date().toISOString().substr(0, 7) + "."
let rngseedCounter = 0
let rngseed_override: string | undefined

export function setRngseed(seed?: string) {
  rngseed_override = seed
}

function rngseed() {
  // We need a new rngseed for every execution, or all runs will either pass or
  // fail:
  return orElse(rngseed_override, () => rngseedPrefix + rngseedCounter++)
}

let failrate = "0.1" // 10%

export function setFailrate(percent: number = 10) {
  failrate = (percent / 100).toFixed(2)
}

let unluckyfail = "1"

/**
 * Should EUNLUCKY be handled properly by the test script, and emit a "FAIL", or
 * require batch-cluster to timeout the job?
 *
 * Basically setting unluckyfail to true is worst-case behavior for a script,
 * where all flaky errors require a timeout to recover.
 */
export function setUnluckyFail(b = true) {
  unluckyfail = b ? "1" : "0"
}

let newline = "lf"

export function setNewline(eol: "lf" | "crlf" = "lf") {
  newline = eol
}

let ignoreExit: "1" | "0" = "0"

export function setIgnoreExit(ignore: boolean = false) {
  ignoreExit = ignore ? "1" : "0"
}

beforeEach(() => {
  setFailrate()
  setUnluckyFail()
  setNewline()
  setIgnoreExit()
  setRngseed()
})

export const processFactory = () => {
  const proc = spawn(_p.execPath, [join(__dirname, "test.js")], {
    env: {
      rngseed: rngseed(),
      failrate,
      newline,
      ignoreExit,
      unluckyfail
    }
  })
  procs.push(proc)
  return proc
}
