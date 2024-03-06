import Web3 from 'web3';

export default async function benchmarkEthGetLogs(repeatTimes: number, urls: string[], rpcMethodParams: any) {
    const step = rpcMethodParams.step;
    const offset = rpcMethodParams.offset;
    const timingResults: { url: string; totalDuration: number; averageDuration: number }[] = [];

    for (const url of urls) {
        let totalDuration = 0;
        
        // Iterate the specified number of times
        for (let i = 0; i < repeatTimes; i++) {
            const web3 = new Web3(url);
            const currentBlockNumber = await web3.eth.getBlockNumber();
            const startBlockNumber = currentBlockNumber - offset;

            const startTime = Date.now();
            // Fetch logs for the current block number range
            for (let blockNumber = startBlockNumber; blockNumber <= currentBlockNumber; blockNumber += step) {
                // Define a filter to fetch all logs from the current block number to the currentBlockNumber
                const filter = {
                    fromBlock: blockNumber,
                    toBlock: Math.min(blockNumber + step - 1, Number(currentBlockNumber))
                };

                await web3.eth.getPastLogs(filter);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;
            totalDuration += duration;
            console.log(`URL: ${url}, Iteration ${i + 1}: Fetched logs from block ${startBlockNumber} to ${currentBlockNumber} in ${duration}ms`);
        }

        const averageDuration = totalDuration / repeatTimes;
        timingResults.push({ url, totalDuration, averageDuration });
        console.log(`URL: ${url}, Average time to fetch logs: ${averageDuration.toFixed(2)}ms`);
    }

    console.log('Timing Results:', timingResults);
}
