import { mkdir, writeFile, readFile, access } from "fs/promises";
import { join } from "path";
import { parse } from "smol-toml";
import logger from "./logger";

export interface Config {
	benchRpcProvider: string;
	preBenchDataProvider: string;
	concurrency: number;
	duration: number;
	output: string;
	logLevel?: string;
}

export async function loadConfig(): Promise<Config> {
	const tomlContent = await readFile("config.toml", "utf-8");
	const config = parse(tomlContent);

	// validate the config object
	if (
		typeof config.benchRpcProvider !== "string" ||
		typeof config.preBenchDataProvider !== "string" ||
		typeof config.concurrency !== "number" ||
		typeof config.duration !== "number" ||
		typeof config.output !== "string" ||
		typeof config.logLevel !== "string"
	) {
		throw new Error("Invalid configuration.");
	}

	return {
		benchRpcProvider: config.benchRpcProvider,
		preBenchDataProvider: config.preBenchDataProvider,
		concurrency: config.concurrency,
		duration: config.duration,
		output: config.output,
		logLevel: config.logLevel,
	};
}

export interface BenchmarkResult {
	method: string;
	totalRequests: number;
	failedRequests: number;
	elapsedTime: number;
	avgRps: number;
	successRate: number;
}

export function benchStartConsole(method: string, config: Config) {
	logger.info(
		`Starting benchmark ${method} to ${config.benchRpcProvider} with ${config.concurrency} concurrency for ${config.duration} milliseconds`
	);
}

export function benchResultConsole(result: BenchmarkResult) {
	logger.info(
		`Benchmark ${result.method} completed with ${result.totalRequests} requests in ${result.elapsedTime}ms`
	);
}

// Collect the benchmark result and save it to a JSON file, this is useful for comparing the performance of different RPC providers.
export async function saveBenchMarkResult(
	result: BenchmarkResult,
	config: Config
) {
	interface JsonResult {
		benchRpcProvider: string;
		concurrency: number;
		duration: number;
		time: string;
		totalRequests: number;
		failedRequests: number;
		avgRps: number;
		successRate: number;
	}

	const filePath = join(config.output, `${result.method}.json`);
	let jsonResult: JsonResult[] = [];
	try {
		await access(filePath);
	} catch (error) {
		await mkdir(config.output, { recursive: true });
		await writeFile(filePath, JSON.stringify(jsonResult));
	}

	// Append the new result to the existing JSON file
	const json = await readFile(filePath, "utf-8");
	jsonResult = JSON.parse(json);
	jsonResult.push({
		benchRpcProvider: config.benchRpcProvider,
		concurrency: config.concurrency,
		duration: config.duration,
		time: new Date().toISOString(),
		totalRequests: result.totalRequests,
		failedRequests: result.failedRequests,
		avgRps: result.avgRps,
		successRate: result.successRate,
	});
	await writeFile(filePath, JSON.stringify(jsonResult, null, 2));
	logger.info(`Benchmark result saved to ${filePath}`);
}
