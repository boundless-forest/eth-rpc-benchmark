import { loadConfig, benchStartConsole, BenchmarkResult, benchResultConsole, saveBenchMarkResult } from './bench';
import logger from './logger';
import { ethers } from 'ethers';
import { performance } from 'perf_hooks';

async function getBlockByNumber(provider: ethers.JsonRpcProvider, number: number) {
	return provider.getBlock(number);
}

async function runBenchmark() {
	const method = 'eth_getblockByNumber';
	const config = await loadConfig();
	const { benchRpcProvider, concurrency, duration } = config;
	const provider = new ethers.JsonRpcProvider(benchRpcProvider);

	benchStartConsole(method, config);

	let startTime = performance.now();
	let totalRequests = 0;
	let failedRequests = 0;
	const latestBlockNumber = await provider.getBlockNumber();
	while (performance.now() - startTime < duration) {
		const randomBlockNumbers = Array.from({ length: concurrency }, () =>
			Math.floor(Math.random() * latestBlockNumber),
		);
		logger.debug(`Random block numbers: ${randomBlockNumbers}`);
		const promises = randomBlockNumbers.map((blockNumber) => getBlockByNumber(provider, blockNumber));
		totalRequests += concurrency;

		const results = await Promise.allSettled(promises);
		results.forEach((result) => {
			if (result.status === 'rejected') {
				failedRequests++;
				logger.error(result.reason);
			} else {
				logger.debug(`Successfully fetched block: ${result.value?.number}`);
			}
		});
	}

	const elapsedTime = performance.now() - startTime;
	const avgRps = totalRequests / (elapsedTime / 1000);
	const successRate = ((totalRequests - failedRequests) / totalRequests) * 100;
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
