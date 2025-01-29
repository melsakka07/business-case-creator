// Suppress specific deprecation warning
(process as any).noDeprecation = true;

import type { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const BASE_DIR = join(__dirname, '..', 'json_files');

app.post('/api/save-questionnaire', async (req: Request, res: Response) => {
  try {
    const { data, projectName } = req.body;

    // Format date and sanitize filename
    const now = new Date();
    const dateTime = now.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('.')[0];
    
    const sanitizedProjectName = projectName.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
    const fileName = `${sanitizedProjectName}_${dateTime}`;
    
    // Create base directory if it doesn't exist
    await fs.mkdir(BASE_DIR, { recursive: true });
    
    // Create project directory
    const projectDir = join(BASE_DIR, fileName);
    await fs.mkdir(projectDir, { recursive: true });
    
    // Create and write JSON file
    const filePath = join(projectDir, `${fileName}.json`);
    const jsonContent = JSON.stringify({
      project_name: projectName,
      timestamp: now.toISOString(),
      data: data
    }, null, 2);
    
    await fs.writeFile(filePath, jsonContent, 'utf-8');
    
    res.json({ 
      success: true, 
      filePath: filePath.replace(process.cwd(), ''),
      message: 'Questionnaire saved successfully!' 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save questionnaire data' 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 