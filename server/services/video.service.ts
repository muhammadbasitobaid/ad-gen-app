import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import VideoRequest from "@models/videoRequest.model";

import path from "path";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// Set credentials for Vertex AI
process.env.GOOGLE_APPLICATION_CREDENTIALS = './creds.json';
process.env.GOOGLE_CLOUD_PROJECT = 'ai-project-jul-19';
process.env.GOOGLE_CLOUD_LOCATION = 'us-central1';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

const JOB_TIMEOUT = 10 * 60 * 1000; // 10 minutes

/**
 * Processes a video generation job in the background.
 * @param {string} dbId - The database ID of the VideoRequest record.
 * @param {any} operation - The initial operation object from the Google AI API.
 */
async function processVideoJob(dbId: string, operation: any) {
  console.log(`[Job ${dbId}] Starting background processing.`);
  try {
    const pollPromise = (async () => {
      let currentOperation = operation;
      while (!currentOperation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second poll
        currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
        console.log(`[Job ${dbId}] Polling... Status: ${currentOperation.metadata?.state}`);
      }
      return currentOperation;
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Job timed out')), JOB_TIMEOUT)
    );

    const finalOperation = await Promise.race([pollPromise, timeoutPromise]);

    const generatedVideos = finalOperation.response?.generatedVideos;
    if (!generatedVideos || generatedVideos.length === 0) {
      throw new Error("No videos generated in the final operation response.");
    }

    const video = generatedVideos[0];
    const videoFileName = `${uuidv4()}.mp4`;
    const downloadPath = path.join(process.cwd(), "public/videos", videoFileName);

    console.log(`[Job ${dbId}] Video generated. Downloading to: ${downloadPath}`);

    await ai.files.download({
      file: video,
      downloadPath: downloadPath,
    });

    const localUrl = `/videos/${videoFileName}`;
    console.log(`[Job ${dbId}] Download completed. Video saved to: ${localUrl}`);

    // Update the database with the local URL
    await VideoRequest.findByIdAndUpdate(dbId, {
      status: 'COMPLETED',
      videoUrl: localUrl,
    });

  } catch (error: any) {
    const status = error.message.includes('timed out') ? 'TIMEOUT' : 'FAILED';
    console.error(`[Job ${dbId}] Failed. Reason: ${error.message}`);
    await VideoRequest.findByIdAndUpdate(dbId, { status });
  }
}

/**
 * Starts a video generation job.
 * @param {string} useCase - The use case for the video.
 * @param {string} prompt - The prompt for the video.
 * @returns The newly created video request record.
 */
export const startVideoGeneration = async (useCase: string, prompt: string) => {
  // 1. Create a placeholder record in the database
  const newRequest = await VideoRequest.create({
    useCase,
    prompt,
    status: 'PENDING',
  });
  const dbId = newRequest.id;
  console.log(`[Job ${dbId}] Created pending request in DB.`);

  // 2. Start the video generation job
  const operation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt,
  });
  const operationId = operation.name;

  // 3. Update the record with the operation ID and set status to RUNNING
  newRequest.operationId = operationId;
  newRequest.status = 'RUNNING';
  await newRequest.save();
  console.log(`[Job ${dbId}] Started Google AI operation: ${operationId}`);

  // 4. Start background processing without awaiting it
  processVideoJob(dbId, operation);

  return newRequest;
};

/**
 * Gets the status of a video generation job.
 * @param {string} operationId - The operation ID of the job.
 * @returns The video request record, or null if not found.
 */
export const getVideoJobStatus = async (operationId: string) => {
  return await VideoRequest.findOne({ operationId });
};
