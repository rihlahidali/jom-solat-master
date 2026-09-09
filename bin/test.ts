import { configure, processCLIArgs, run } from "@japa/runner";
import { plugins } from "../tests/bootstrap";

processCLIArgs(process.argv.splice(2));
configure({
  plugins,
  files: ["tests/domain/**/*.spec.ts", "tests/functional/**/*.spec.ts"],
});
run();
