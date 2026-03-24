const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export const logger = {
  info(msg: string, ...args: unknown[]) {
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.blue}INFO${COLORS.reset}  ${msg}`, ...args);
  },

  success(msg: string, ...args: unknown[]) {
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.green}✓${COLORS.reset}     ${msg}`, ...args);
  },

  warn(msg: string, ...args: unknown[]) {
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.yellow}WARN${COLORS.reset}  ${msg}`, ...args);
  },

  error(msg: string, ...args: unknown[]) {
    console.error(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.red}ERROR${COLORS.reset} ${msg}`, ...args);
  },

  debug(msg: string, ...args: unknown[]) {
    if (process.env.DEBUG === 'true') {
      console.log(`${COLORS.gray}[${timestamp()}] DEBUG ${msg}${COLORS.reset}`, ...args);
    }
  },

  divider() {
    console.log(`${COLORS.gray}${'─'.repeat(60)}${COLORS.reset}`);
  },

  header(msg: string) {
    console.log(`\n${COLORS.bold}${COLORS.cyan}▸ ${msg}${COLORS.reset}`);
  },

  dryRunBox(data: Record<string, unknown>) {
    console.log(`\n${COLORS.bold}${COLORS.yellow}═══ DRY-RUN RESULT ═══${COLORS.reset}`);
    for (const [key, value] of Object.entries(data)) {
      const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      console.log(`${COLORS.cyan}${key}:${COLORS.reset} ${displayValue}`);
    }
    console.log(`${COLORS.yellow}═══════════════════════${COLORS.reset}\n`);
  },
};
