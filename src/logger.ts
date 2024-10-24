import winston, { transports } from "winston";
import { loadConfig } from "./bench";

const config = await loadConfig();
const logger = winston.createLogger({
	level: config.logLevel || "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ level, message, timestamp }) => {
			return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
		})
	),
	transports: [new transports.Console()],
});

export default logger;
