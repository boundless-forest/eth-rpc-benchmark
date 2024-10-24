# Eth RPC Benchmark

This repository contains a simple benchmarking tool for Ethereum compatible chains JSON-RPC methods. 

## Supported Methods

- [x] `eth_blockNumber`
- [x] `eth_getBlockByNumber`
- [ ] `eth_getBlockByHash`
- [ ] `eth_accounts`
- [ ] `eth_call`
- [ ] `eth_getTransactionByHash`
- [ ] `eth_getTransactionReceipt`
- [ ] `eth_getTransactionByBlockHashAndIndex`
- [ ] `eth_getTransactionCount`
- [ ] `eth_getBalance`
- [ ] `eth_getCode`
- [ ] `eth_estimateGas`
- [ ] `eth_gasPrice`
- [ ] `eth_getStorageAt`
- [ ] `eth_syncing`
- [ ] `eth_chainId`

## Usage

### Install

```sh
pnpm install
```

### Configure

```toml
rpcProvider = "https://darwinia-rpc.dwellir.com"
concurrency = 20
duration = 6000
output = "output"
```

### Run

```sh
# Run the benchmark for eth_blockNumber
pnpm run --silent ethBlockNumber

# Run the benchmark for eth_getBlockByNumber
pnpm run --silent ethGetBlockByNumber
```

After running the benchmark, the results will be appended to a file named after the RPC method in the `output` directory (by default). This allows us to compare the performance of different RPC providers. 
