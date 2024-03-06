import Web3 from 'web3';

export default async function benchmarkEthGetBlockNumber(repeatTimes: number, urls: string[], rpcMethodParams: any) {
    const timingResults: { url: string; totalDuration: number; averageDuration: number }[] = [];
    const timeoutDuration = 2000; // Timeout duration in milliseconds (2000ms = 2s)

    for (const url of urls) {
        let totalDuration = 0;

        for (let i = 0; i < repeatTimes; i++) {
            const startTime = Date.now();
            const web3 = new Web3(url);

            // Wrap the RPC call in a Promise.race to add a timeout
            try {
                await Promise.race([
                    web3.eth.getBlockNumber(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('fetch information failed, time out')), timeoutDuration))
                ]);

                const endTime = Date.now();
                const duration = endTime - startTime;
                totalDuration += duration;
                console.log(`URL: ${url}, Iteration ${i + 1}: Current block number fetched in ${duration}ms`);
            } catch (error) {
                console.error(`URL: ${url}, Iteration ${i + 1}: ${(error as Error).message}`);
            }
        }

        const averageDuration = totalDuration / repeatTimes;
        timingResults.push({ url, totalDuration, averageDuration });
        console.log(`URL: ${url}, Average time to fetch block number: ${averageDuration.toFixed(2)}ms`);
    }

    console.log('Timing Results:', timingResults);
}
