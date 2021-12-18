import "colors";

export const Level = {
  LOG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

export class Logger<T> {
  public static log(message: string) {
    return new Logger<string>(Level.LOG, message);
  }
  public static info(message: string) {
    return new Logger<string>(Level.INFO, message);
  }
  public static error(message: string | Error) {
    return new Logger<typeof message>(Level.ERROR, message);
  }
  public static warn(message: string) {
    return new Logger<string>(Level.WARN, message);
  }
  constructor(level: number, message: T) {
    switch (level) {
      case Level.LOG:
        console.log(message);
        break;
      case Level.INFO:
        console.log(`${"[i]".bgBlue} ${message}`);
        break;
      case Level.WARN:
        console.log(`${"[!]".bgYellow} ${message}`);
        break;
      case Level.ERROR:
        console.log(
          `${"[X]".bgRed} ${
            message instanceof Error ? message.message : message
          }`
        );
        break;
      default:
        console.log(message);
    }
  }
}
