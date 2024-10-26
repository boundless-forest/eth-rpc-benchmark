import { loadConfig, BenchmarkResult, saveBenchMarkResult } from './bench';
import { benchStartConsole, benchResultConsole, preBenchmarkConsole } from './logger';
import logger from './logger';
import { ethers } from 'ethers';
import { performance } from 'perf_hooks';

async function getCode(provider: ethers.JsonRpcProvider, address: string) {
	return provider.getCode(address);
}

// This function will iterate over the blocks from the preBenchDataProvider and fetch the contracts address deployed
// in those blocks, then save those addressed into a vector and give it to the runBenchmark function. This is aimed
// to avoid the cache of the real benchmark provider.
async function preBenchmark(): Promise<string[]> {
	const config = await loadConfig();
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
	const contractAddresses = await preBenchmark();
	logger.debug(`contractAddresses: ${contractAddresses}`);
}

await runBenchmark();
