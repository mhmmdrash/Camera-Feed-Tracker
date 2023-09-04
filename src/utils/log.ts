import fs from 'fs';
import path from 'path';

const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

export const logOperation = (operation: string) => {
  const now = new Date();
  const logFileName = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}.log`;
  const logFilePath = path.join(logDirectory, logFileName);

  const logEntry = `${now.toISOString()} - ${operation}\n`;

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Error logging operation:', err);
    }
  });

  // Delete log files older than 30 minutes
  const thirtyMinutesAgo = new Date(now.getMilliseconds() - 30 * 60 * 1000);
  fs.readdir(logDirectory, (err, files) => {
    if (err) {
      console.error('Error reading log directory:', err);
    } else {
      files.forEach((file) => {
        const filePath = path.join(logDirectory, file);
        const fileCreationTime = fs.statSync(filePath).ctime;

        if (fileCreationTime < thirtyMinutesAgo) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting log file:', err);
            }
          });
        }
      });
    }
  });
};