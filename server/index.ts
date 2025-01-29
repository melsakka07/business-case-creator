import { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import { promises as fs } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = path.join(__dirname, '..', 'json_files');

const app = express();
const PORT = process.env.PORT || 3002;

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Enhanced error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    body: req.body
  });
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Initialize storage directory
async function initializeStorage() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    await fs.chmod(STORAGE_DIR, 0o755);
    console.log(`Storage directory initialized at: ${STORAGE_DIR}`);
  } catch (error) {
    console.error('Storage initialization failed:', error);
    process.exit(1);
  }
}

// Validate questionnaire structure
function validateQuestionnaire(data: any): { valid: boolean; message?: string } {
  if (!data?.sections?.length) return { valid: false, message: 'No sections provided' };
  
  for (const [index, section] of data.sections.entries()) {
    if (!section?.title?.trim()) return { valid: false, message: `Section ${index + 1} missing title` };
    if (!section?.questions?.length) return { valid: false, message: `Section "${section.title}" has no questions` };
  }
  
  return { valid: true };
}

app.post('/api/save-questionnaire', async (req: Request, res: Response) => {
  try {
    console.log('Received request body:', req.body);

    const { data, projectName } = req.body;
    
    if (!projectName || !data) {
      console.error('Invalid request:', { projectName, dataExists: !!data });
      return res.status(400).json({
        success: false,
        message: 'Project name and data are required'
      });
    }

    const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
    const safeProjectName = projectName.toString().replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
    const dirName = `${safeProjectName}_${timestamp}`;
    const fileName = `${dirName}.json`;
    
    // Ensure storage directory exists
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    
    // Create project-specific directory
    const projectDir = path.join(STORAGE_DIR, dirName);
    await fs.mkdir(projectDir, { recursive: true });
    
    const filePath = path.join(projectDir, fileName);
    console.log('Writing to:', filePath);

    const fileContent = JSON.stringify({
      projectName,
      timestamp: new Date().toISOString(),
      data
    }, null, 2);

    await fs.writeFile(filePath, fileContent, 'utf8');
    console.log('File written successfully');

    res.json({
      success: true,
      filePath: path.relative(process.cwd(), filePath),
      message: 'Questionnaire saved successfully!'
    });

  } catch (error) {
    console.error('Error saving questionnaire:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save questionnaire data',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Configure graceful shutdown
function configureShutdown() {
  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Start server
async function startServer() {
  await initializeStorage();
  configureShutdown();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Storage directory: ${STORAGE_DIR}`);
  });
}

startServer().catch(error => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
