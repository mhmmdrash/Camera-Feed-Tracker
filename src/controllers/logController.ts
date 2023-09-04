import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { getUserRole } from './feedController';

const logDirectory = path.join("/Users/muhammedrasheed/adeodist-assignment/src/utils", 'logs');

// API route to read the log file
export const readLogs = async (req: AuthenticatedRequest, res: Response) => {

    const role = await getUserRole(req.user?.id);
    if (role != 'super-admin') {
        return res.status(500).json({
            message: "Not authorised to view logs"
        })
    }

    // Get the list of log files in the log directory
  fs.readdir(logDirectory, (err, files) => {
    if (err) {
      console.error('Error reading log directory:', err);
      return res.status(500).json({ message: 'Error reading log directory' });
    }

    // Find the most recent log file based on file creation time
    let mostRecentLogFile = '';
    let mostRecentLogTime = 0;

    files.forEach((file) => {
      const filePath = path.join(logDirectory, file);
      const fileCreationTime = fs.statSync(filePath).ctimeMs;

      if (fileCreationTime > mostRecentLogTime) {
        mostRecentLogFile = filePath;
        mostRecentLogTime = fileCreationTime;
      }
    });

    // Check if any log files were found
    if (!mostRecentLogFile) {
      return res.status(404).json({ message: 'No log files found' });
    }

    // Read the content of the most recent log file
    fs.readFile(mostRecentLogFile, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading log file:', err);
        return res.status(500).json({ message: 'Error reading log file' });
      }

      // Return the log file content as the response
      return res.status(200).send(data);
    });
  });
}
