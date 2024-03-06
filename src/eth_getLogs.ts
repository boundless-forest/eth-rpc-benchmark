import Web3 from 'web3';

export default async function benchmarkEthGetLogs(repeatTimes: number, urls: string[], rpcMethodParams: any) {
    const step = BigInt(rpcMethodParams.step);
    const offset = BigInt(rpcMethodParams.offset);
    const timeoutDuration = rpcMethodParams.timeoutDuration;

    for (const url of urls) {
        console.log(`\n===== Starting benchmark for URL: ${url} =====`);

        for (let i = 0; i < repeatTimes; i++) {
            console.log(`=== Iteration ${i + 1}: Start fetching block logs... ===`);
            const web3 = new Web3(url);
            const currentBlockNumber = await web3.eth.getBlockNumber();
            const startBlockNumber = currentBlockNumber - offset;

            let totalDurationForIteration = 0; // Initialize total duration for each iteration
            let stepCountForIteration = 0; // Initialize step count for each iteration

            for (let blockNumber = startBlockNumber; blockNumber <= currentBlockNumber; blockNumber += step) {
                const toBlockNumber = Math.min(Number(blockNumber + step - 1n), Number(currentBlockNumber));
                const filter = {
                    fromBlock: blockNumber,
                    toBlock: toBlockNumber
                };

                // Measure time for each block range
                const startTime = Date.now();

                // Wrap the getPastLogs call in a Promise.race to add a timeout
                try {
                    await Promise.race([
                        web3.eth.getPastLogs(filter),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('fetch information failed, time out')), timeoutDuration))
                    ]);
                } catch (error) {
                    console.error(`\nError fetching Block logs from ${blockNumber} to ${toBlockNumber}: ${(error as Error).message}`);
                    continue;
                }

                const endTime = Date.now();
                const duration = endTime - startTime;
                console.log(`Fetch block logs from ${blockNumber} to ${toBlockNumber}: in ${duration}ms`);
                totalDurationForIteration += duration;
                stepCountForIteration++;
            }

            // Calculate and output the average time for fetching logs for each step range
            const averageDurationForIteration = totalDurationForIteration / stepCountForIteration;
            console.log(`=== Average time for fetching logs in this iteration: ${averageDurationForIteration.toFixed(2)}ms ===`);
        }
    }
}
