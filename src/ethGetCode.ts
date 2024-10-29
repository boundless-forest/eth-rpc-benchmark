import { loadConfig, BenchmarkResult, saveBenchMarkResult, Config } from './bench';
import { benchStartConsole, benchResultConsole, preBenchmarkConsole } from './logger';
import logger from './logger';
import { ethers } from 'ethers';
import { performance } from 'perf_hooks';

async function getCode(provider: ethers.JsonRpcProvider, address: string) {
	return provider.getCode(address);
}

async function preBenchmark(config: Config): Promise<string[]> {
	const { preBenchDataProvider, concurrency } = config;
	const provider = new ethers.JsonRpcProvider(preBenchDataProvider);
	preBenchmarkConsole(config);

	const latestBlockNumber = await provider.getBlockNumber();
	let blockNumber = latestBlockNumber;
	const contractAddresses: string[] = [];

	logger.debug(`started at blockNumber: ${blockNumber}`);
	while (contractAddresses.length < concurrency && blockNumber > 0) {
		const block = await provider.getBlock(blockNumber, true);
		if (block && block.transactions) {
			for (const txHash of block.transactions) {
				const tx = await provider.getTransaction(txHash);
				if (tx && tx.to) {
					const code = await getCode(provider, tx.to);
					if (code != '0x' && contractAddresses.indexOf(tx.to) === -1) {
						contractAddresses.push(tx.to);
						logger.debug(`Found contract address: ${tx.to}`);

						if (contractAddresses.length >= concurrency) {
							break;
						}
					}
				}
			}
		}
		blockNumber -= 50;
	}

	return contractAddresses;
}

async function runBenchmark() {
	const method = 'eth_getCode';
	const config = await loadConfig();
	const { benchRpcProvider, concurrency, duration } = config;
	const provider = new ethers.JsonRpcProvider(benchRpcProvider);

	const contractAddresses = await preBenchmark(config);
	logger.debug(`contractAddresses: ${contractAddresses}`);

	benchStartConsole(method, config);

	let startTime = performance.now();
	let totalRequests = 0;
	let failedRequests = 0;
	while (performance.now() - startTime < duration) {
		const promises = contractAddresses.map((contract) => getCode(provider, contract));
		totalRequests += concurrency;

		const results = await Promise.allSettled(promises);
		results.forEach((result) => {
			if (result.status === 'rejected') {
				failedRequests++;
				logger.error(result.reason);
			} else {
				logger.debug(`Successfully fetched contract code.`);
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
