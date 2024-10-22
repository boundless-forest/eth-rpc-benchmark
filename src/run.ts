import { readFileSync } from "fs";
import { parse } from "smol-toml";

type ErrorOptions = {
	cause?: unknown;
};

interface Config {
	rpcProvider: string;
	threads: number;
	duration: number;
}

export function loadConfig(): Config {
	const tomlContent = readFileSync("config.toml", "utf-8");
	const config = parse(tomlContent);

    // validate the config object
	if (
		typeof config.rpcProvider !== "string" ||
		typeof config.threads !== "number" ||
		typeof config.duration !== "number"
	) {
		throw new Error("Invalid configuration.");
	}

	return {
		rpcProvider: config.rpcProvider,
		threads: config.threads,
		duration: config.duration,
	};
}

export function benchStartConsole(method: string, config: Config) {
	console.log(
		`Benchmarking ${method} to ${config.rpcProvider} with ${config.threads} threads for ${config.duration} seconds`
	);
}
