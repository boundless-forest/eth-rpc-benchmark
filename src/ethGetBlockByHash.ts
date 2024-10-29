import { loadConfig, BenchmarkResult, saveBenchMarkResult, Config } from './bench';
import { benchResultConsole, benchStartConsole, preBenchmarkConsole } from './logger';
import logger from './logger';
import { ethers } from 'ethers';
import { performance } from 'perf_hooks';

async function getBlockByNumber(provider: ethers.JsonRpcProvider, number: number) {
	return provider.getBlock(number);
}

async function getBlockByHash(provider: ethers.JsonRpcProvider, hash: string) {
	return provider.getBlock(hash);
}

async function preBenchmark(config: Config): Promise<string[]> {
	const { preBenchDataProvider, concurrency } = config;
	const provider = new ethers.JsonRpcProvider(preBenchDataProvider);
	preBenchmarkConsole(config);

	const latestBlockNumber = await provider.getBlockNumber();
	const randomBlockNumbers = Array.from({ length: concurrency }, () => Math.floor(Math.random() * latestBlockNumber));
    logger.debug(`Random block numbers: ${randomBlockNumbers}`);
    
	const hashes: string[] = [];
    for (const blockNumber of randomBlockNumbers) {
        const block = await provider.getBlock(blockNumber, false);
        if (block && block.hash) {
            hashes.push(block.hash);
        } else {
            logger.error(`Failed to fetch block: ${blockNumber}`);
        }

    }

	return hashes;
}

async function runBenchmark() {
	const method = 'eth_getBlockByHash';
	const config = await loadConfig();
	const { benchRpcProvider, concurrency, duration } = config;
	const provider = new ethers.JsonRpcProvider(benchRpcProvider);

    const hashes = await preBenchmark(config);
    logger.debug(`sample hashes: ${hashes}`);

	benchStartConsole(method, config);

	let startTime = performance.now();
	let totalRequests = 0;
	let failedRequests = 0;
	while (performance.now() - startTime < duration) {
		const promises = hashes.map((h) => getBlockByHash(provider, h));
		totalRequests += concurrency;

		const results = await Promise.allSettled(promises);
		results.forEach((result) => {
			if (result.status === 'rejected') {
				failedRequests++;
				logger.error(result.reason);
			} else {
				logger.debug(`Successfully fetched block via hash: ${result.value?.number}`);
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
