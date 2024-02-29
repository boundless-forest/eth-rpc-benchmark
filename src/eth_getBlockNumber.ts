import Web3 from 'web3';

export default async function benchmarkEthGetBlockNumber(repeatTimes: number, urls: string[], rpcMethodParams: any) {
    const timingResults: { url: string; totalDuration: number; averageDuration: number }[] = [];

    // Iterate over each URL
    for (const url of urls) {
        let totalDuration = 0;

        for (let i = 0; i < repeatTimes; i++) {
            const startTime = Date.now();
            const web3 = new Web3(url);

            await web3.eth.getBlockNumber();

            const endTime = Date.now();
            const duration = endTime - startTime;
            totalDuration += duration;
            console.log(`URL: ${url}, Iteration ${i + 1}: Current block number fetched in ${duration}ms`);
        }

        const averageDuration = totalDuration / repeatTimes;
        timingResults.push({ url, totalDuration, averageDuration });
        console.log(`URL: ${url}, Average time to fetch block number: ${averageDuration.toFixed(2)}ms`);
    }

    console.log('Timing Results:', timingResults);
}
