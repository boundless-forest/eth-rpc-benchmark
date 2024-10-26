import winston, { transports } from 'winston';
import { loadConfig } from './bench';
import { Config, BenchmarkResult } from './bench';

const config = await loadConfig();
const logger = winston.createLogger({
	level: config.logLevel || 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ level, message, timestamp }) => {
			return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
		}),
	),
	transports: [new transports.Console()],
});

export function preBenchmarkConsole(config: Config) {
	logger.info(
		`Pre-benchmarking to ${config.preBenchDataProvider} with ${config.concurrency} concurrency`,
	);
}

export function benchStartConsole(method: string, config: Config) {
	logger.info(
		`Starting benchmark ${method} to ${config.benchRpcProvider} with ${config.concurrency} concurrency for ${config.duration} milliseconds`,
	);
}

export function benchResultConsole(result: BenchmarkResult) {
	logger.info(
		`Benchmark ${result.method} completed with ${result.totalRequests} requests in ${result.elapsedTime}ms`,
	);
}

export default logger;
