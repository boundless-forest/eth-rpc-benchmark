# Eth RPC Benchmark

This repository contains a simple benchmarking tool for Ethereum compatible chains JSON-RPC methods. 

## Supported Methods

- [x] `eth_blockNumber`
- [x] `eth_getBlockByNumber`
- [x] `eth_getBlockByHash`
- [x] `eth_getCode`
- [ ] `eth_getTransactionByHash`
- [ ] `eth_getTransactionReceipt`
- [ ] `eth_getBalance`
- [ ] `eth_estimateGas`
- [ ] `eth_getStorageAt`


## Usage

### Install

```sh
pnpm install
```

### Configure

```toml
benchRpcProvider = "https://optimism-mainnet.public.blastapi.io"
preBenchDataProvider = "https://optimism-mainnet.public.blastapi.io"
concurrency = 10
duration = 3000
output = "output"
logLevel = "debug"
```

### Run

```sh
# Run the benchmark for eth_blockNumber
pnpm run --silent ethBlockNumber

# Run the benchmark for eth_getBlockByNumber, ethGetBlockByHash
pnpm run --silent ethGetBlockByNumber
pnpm run --silent ethGetBlockByHash

# Run the benchmark for eth_getCode
pnpm run --silent ethGetCode
```

After running the benchmark, the results will be appended to a file named after the RPC method in the `output` directory (by default). This allows us to compare the performance of different RPC providers. 

```json
// output: eth_getCode.json
[
  {
    "benchRpcProvider": "https://mainnet.optimism.io",
    "concurrency": 10,
    "duration": 3000,
    "time": "2024-10-29T08:03:37.667Z",
    "totalRequests": 120,
    "failedRequests": 120,
    "avgRps": 37.47291196783611,
    "successRate": 0
  },
  {
    "benchRpcProvider": "https://optimism-mainnet.public.blastapi.io",
    "concurrency": 10,
    "duration": 3000,
    "time": "2024-10-29T08:07:49.011Z",
    "totalRequests": 40,
    "failedRequests": 0,
    "avgRps": 10.142906554750915,
    "successRate": 100
  }
]
```
