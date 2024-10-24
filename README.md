# Eth RPC Benchmark

This repository contains a simple benchmarking tool for Ethereum compatible chains JSON-RPC methods. 

## Supported Methods

- [x] `eth_blockNumber`
- [ ] `eth_accounts`
- [ ] `eth_call`
- [ ] `eth_getTransactionByHash`
- [ ] `eth_getTransactionReceipt`
- [ ] `eth_getTransactionByBlockHashAndIndex`
- [ ] `eth_getTransactionCount`
- [ ] `eth_getBlockByHash`
- [ ] `eth_getBlockByNumber`
- [ ] `eth_getBalance`
- [ ] `eth_getCode`
- [ ] `eth_estimateGas`
- [ ] `eth_gasPrice`
- [ ] `eth_getStorageAt`
- [ ] `eth_accounts`
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
pnpm run --silent ethBlockNumber
```

The benchmark result will be saved in a file named with rpc method under the `output` directory(by default). 
