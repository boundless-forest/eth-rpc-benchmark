import {
	loadConfig,
	benchStartConsole,
	BenchmarkResult,
	benchResultConsole,
    saveBenchMarkResult,
} from "./bench";
import { ethers } from "ethers";
import { performance } from "perf_hooks";

async function getBlockNumber(provider: ethers.JsonRpcProvider) {
	return provider.getBlockNumber();
}

async function runBenchmark() {
	const method = "eth_blockNumber";
	const config = await loadConfig();
	const { rpcProvider, concurrency, duration } = config;
	const provider = new ethers.JsonRpcProvider(rpcProvider);

	benchStartConsole(method, config);

	let startTime = performance.now();
	let totalRequests = 0;

	while (performance.now() - startTime < duration) {
		const promises = Array(concurrency)
			.fill(null)
			.map(() => getBlockNumber(provider));

		try {
			await Promise.all(promises);
			totalRequests += concurrency;
		} catch (error) {
			console.error(error);
		}
	}

	const elapsedTime = performance.now() - startTime;
	const avgRps = totalRequests / (elapsedTime / 1000);
	const result: BenchmarkResult = {
		method,
		totalRequests,
		elapsedTime,
		avgRps,
	};

	benchResultConsole(result);
    saveBenchMarkResult(result, config);
}

await runBenchmark();
