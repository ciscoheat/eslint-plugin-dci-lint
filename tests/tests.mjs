import { exec as oExec } from "child_process";
//import { stdout } from 'process'
import fs from "fs-extra";

const errorsWanted = 29;
const warningsWanted = 0;

const search =
  /✖ (?<problems>\d+) problems* \((?<errors>\d+) errors*, (?<warnings>\d+) warnings*\)/;

async function exec(command) {
  return new Promise((resolve) =>
    oExec(command, (err, stdout) => resolve(stdout))
  );
}

async function test(file, errorsWanted = 0, warningsWanted = 0) {
  console.log("Testing " + file);

  const stdout = await exec(`npx eslint ${file}`);

  let result = {
    errors: 0,
    warnings: 0,
  };

  if (stdout.trim().length != 0) {
    const parsed = search.exec(stdout);
    if (!parsed || !parsed.groups) {
      console.log(stdout);
      throw new Error("No result found in eslint output");
    }

    if (parsed.input.includes("Parsing error:")) throw new Error(parsed.input);

    const errors = parseInt(parsed.groups.errors) ?? 1000;
    const warnings = parseInt(parsed.groups.warnings) ?? 1000;

    //if (errors) console.log(stdout);

    result = {
      errors,
      warnings,
    };
  }

  const success =
    result.errors == errorsWanted && result.warnings == warningsWanted;
  const expected = { errorsWanted, warningsWanted };

  if (!success) {
    console.error("Test failed", result, expected);
    process.exitCode = 1;
  } else {
    console.log("Tests passed", expected);
  }
}

////////////////////////////////////////////////////////////////////////////////

const file = "tests/MoneyTransfer.ts";
const failing = "tests/Failing.temp.ts";

try {
  await exec("npx tsc");

  await test(file);

  const failingFile = (
    await fs.readFile(file, { encoding: "utf-8" })
  ).replaceAll(/\/\/([\w\/])/g, "$1");
  fs.outputFileSync(failing, failingFile);

  await test(failing, errorsWanted, warningsWanted);
} finally {
  await fs.remove(failing);
}
