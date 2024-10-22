import { loadConfig, benchStartConsole } from "./run";
import { ethers } from "ethers";

function benchmark() {
    const method = "eth_blockNumber";
	const config = loadConfig();
	const { rpcProvider, threads, duration } = config;

    benchStartConsole(method, config);
    
	const provider = new ethers.JsonRpcProvider(rpcProvider);

    // Create threads ts threads to request the eth_blockNumber for a specified duration.

}

benchmark();
