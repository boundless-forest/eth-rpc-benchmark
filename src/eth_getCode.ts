import Web3 from 'web3';

export default async function benchmarkEthGetCode(repeatTimes: number, urls: string[], rpcMethodParams: any) {
    const contractAddresses = rpcMethodParams.contractAddress;
    const timingResults: { url: string; totalDuration: number; averageDuration: number }[] = [];

    for (const url of urls) {
        let totalDuration = 0;

        for (let i = 0; i < repeatTimes; i++) {
            const startTime = Date.now();
            const web3 = new Web3(url);

            for (const address of contractAddresses) {
                await web3.eth.getCode(address);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;
            totalDuration += duration;
            console.log(`URL: ${url}, Iteration ${i + 1}: Fetched contract code in ${duration}ms`);
        }

        const averageDuration = totalDuration / repeatTimes;
        timingResults.push({ url, totalDuration, averageDuration });
        console.log(`URL: ${url}, Average time to fetch contract code: ${averageDuration.toFixed(2)}ms`);
    }

    console.log('Timing Results:', timingResults);
}
