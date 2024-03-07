import Web3 from 'web3';

export default async function benchmarkEthGetLogs(repeatTimes: number, urls: string[], rpcMethodParams: any) {
    const steps = BigInt(rpcMethodParams.steps);
    const offset = BigInt(rpcMethodParams.offset);
    const range = BigInt(rpcMethodParams.range);
    const timeoutDuration = rpcMethodParams.timeoutDuration;

    for (const url of urls) {
        const web3 = new Web3(url);
        const currentBlockNumber = await web3.eth.getBlockNumber();
        const toBlockNumber = currentBlockNumber - offset;
        const startBlockNumber = toBlockNumber - range * steps;
        console.log(`\n===== Starting benchmark for URL: ${url}, startBlockNumber: ${startBlockNumber}, toBlockNumber: ${toBlockNumber}, range: ${range}, steps: ${steps} =====`);

        for (let i = 0; i < repeatTimes; i++) {
            console.log(`=== URL: ${url}, Iteration ${i + 1}: Start fetching block logs... ===`);
            let totalDurationForIteration = 0;
            let stepCountForIteration = 0;

            for (let blockNumber = startBlockNumber; blockNumber <= toBlockNumber; blockNumber += range) {
                const to = Math.min(Number(blockNumber + range - 1n), Number(toBlockNumber));
                const filter = {
                    fromBlock: blockNumber,
                    toBlock: to
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
                    console.error(`Error fetching Block logs from ${blockNumber} to ${to}: ${(error as Error).message}`);
                    continue;
                }

                const endTime = Date.now();
                const duration = endTime - startTime;
                console.log(`Fetch block logs from ${blockNumber} to ${to}: in ${duration}ms`);
                totalDurationForIteration += duration;
                stepCountForIteration++;
            }

            // Calculate and output the average time for fetching logs for each step range
            const averageDurationForIteration = totalDurationForIteration / stepCountForIteration;
            console.log(`=== URL: ${url}, Average time for fetching logs in this iteration: ${averageDurationForIteration.toFixed(2)}ms ===`);
        }
    }
}
