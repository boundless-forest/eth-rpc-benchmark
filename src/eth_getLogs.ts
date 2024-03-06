import Web3 from 'web3';

export default async function benchmarkEthGetLogs(repeatTimes: number, urls: string[], rpcMethodParams: any) {
    const step = BigInt(rpcMethodParams.step);
    const offset = BigInt(rpcMethodParams.offset);
    const timeoutDuration = rpcMethodParams.timeoutDuration;
    const timingResults: { url: string; totalDuration: number; averageDuration: number }[] = [];

    for (const url of urls) {
        let totalDuration = 0;

        for (let i = 0; i < repeatTimes; i++) {
            console.log(`URL: ${url}, Iteration ${i + 1}: Start fetching block logs...`);
            const web3 = new Web3(url);
            const currentBlockNumber = await web3.eth.getBlockNumber();
            const startBlockNumber = currentBlockNumber - offset;

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
                    console.error(`Fetch Block logs from ${blockNumber} to ${toBlockNumber}: ${(error as Error).message}`);
                    continue;
                }

                const endTime = Date.now();
                const duration = endTime - startTime;
                console.log(`Fetch block logs from ${blockNumber} to ${toBlockNumber}: in ${duration}ms`);
                totalDuration += duration;
            }
        }
        const averageDuration = totalDuration / repeatTimes;
        timingResults.push({ url, totalDuration, averageDuration });
        console.log(`URL: ${url}: End all iterations, Average time: ${averageDuration.toFixed(2)}ms`);
    }

    console.log('Timing Results:', timingResults);
}
