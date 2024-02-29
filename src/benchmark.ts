
import { readFileSync } from "fs"
import { join, dirname } from "path"

const [, , rpcMethod, network] = process.argv;
if (!rpcMethod || !network) {
    console.error('Usage: ts-node benchmark.ts <rpcMethod> <network>');
    process.exit(1);
}

export const benchmarkConfig = (network: string): any => {
    const configPath = join(__dirname, 'benchmarkConfig.json');
    const fileContents = readFileSync(configPath, 'utf8');
    const config = JSON.parse(fileContents);
    return config[network];
};


const runBenchmark = async (rpcMethod: string, network: string) => {
    const config = benchmarkConfig(network);
    const repeatTimes = config.benchmarkConfig.repeatTimes;
    const urls = config.benchmarkConfig.urls;
    const rpcMethodParams = config.benchmarkConfig.rpcMethods.find((item: RpcMethod) => item.name === rpcMethod)?.params || {};

    const benchmarkPath = join(__dirname, `${rpcMethod}.ts`);
    const benchmarkModule = await import(benchmarkPath);

    await benchmarkModule.default(repeatTimes, urls, rpcMethodParams);
};

runBenchmark(rpcMethod, network).catch(console.error);

interface RpcMethod {
    name: string;
    params: any;
}