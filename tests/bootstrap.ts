import type { Config } from "@japa/runner/types";
import { assert } from "@japa/assert";

export const plugins: Config["plugins"] = [assert()];
