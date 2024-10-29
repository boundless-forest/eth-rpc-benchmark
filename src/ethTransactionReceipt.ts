import { loadConfig, BenchmarkResult, saveBenchMarkResult, Config } from './bench';
import { benchStartConsole, benchResultConsole, preBenchmarkConsole } from './logger';
import logger from './logger';
import { ethers } from 'ethers';
import { performance } from 'perf_hooks';

async function preBenchmark(config: Config): Promise<string[]> {
	const { preBenchDataProvider, concurrency } = config;
	const provider = new ethers.JsonRpcProvider(preBenchDataProvider);
	preBenchmarkConsole(config);

	const latestBlockNumber = await provider.getBlockNumber();
	let blockNumber = latestBlockNumber;
	const txHashes: string[] = [];

	logger.debug(`started at blockNumber: ${blockNumber}`);
	while (txHashes.length < concurrency && blockNumber > 0) {
		const block = await provider.getBlock(blockNumber, true);
		if (block && block.transactions) {
			for (const txHash of block.transactions) {
				txHashes.push(txHash);
				if (txHashes.length >= concurrency) {
					break;
				}
			}
		}
		blockNumber -= 500;
	}

	return txHashes;
}

async function runBenchmark() {
	const method = 'eth_getTransactionReceipt';
	const config = await loadConfig();
	const { benchRpcProvider, concurrency, duration } = config;
	const provider = new ethers.JsonRpcProvider(benchRpcProvider);

	const txHashes = await preBenchmark(config);
	logger.debug(`txHashes: ${txHashes}`);

	benchStartConsole(method, config);

	let startTime = performance.now();
	let totalRequests = 0;
	let failedRequests = 0;
	while (performance.now() - startTime < duration) {
		const promises = txHashes.map((hash) => provider.getTransactionReceipt(hash));
		totalRequests += concurrency;

		const results = await Promise.allSettled(promises);
		results.forEach((result) => {
			if (result.status === 'rejected') {
				failedRequests++;
				logger.error(result.reason);
			} else {
				logger.debug(`Successfully fetched transaction receipt.`);
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
