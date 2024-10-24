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
	let failedRequests = 0;

	while (performance.now() - startTime < duration) {
		const promises = Array(concurrency)
			.fill(null)
			.map(() => getBlockNumber(provider));
		totalRequests += concurrency;

		const results = await Promise.allSettled(promises);
		results.forEach((result) => {
			if (result.status === "rejected") {
				failedRequests++;
				console.error(result.reason);
			}
		});
	}

	const elapsedTime = performance.now() - startTime;
	const avgRps = totalRequests / (elapsedTime / 1000);
	const successRate =
		((totalRequests - failedRequests) / totalRequests) * 100;
	const result: BenchmarkResult = {
		method,
		totalRequests,
		failedRequests,
		elapsedTime,
		avgRps,
		successRate,
	};

	benchResultConsole(result);
	saveBenchMarkResult(result, config);
}

await runBenchmark();
