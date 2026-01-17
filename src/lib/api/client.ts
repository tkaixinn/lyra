import { API_BASE_URL } from './constants';
import { GenerateSongRequest, GenerateSongResponse, JobStatusResponse } from './types';

const MOOD_TO_TEMPO: Record<string, string> = {
  joyful: 'upbeat',
  peaceful: 'slow',
  nostalgic: 'moderate',
  hopeful: 'moderate',
  grateful: 'moderate',
  loving: 'slow',
};

export async function generateSong(data: GenerateSongRequest): Promise<GenerateSongResponse> {
  const tempo = MOOD_TO_TEMPO[data.mood.toLowerCase()] || 'moderate';
  
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.prompt,
      genre: data.genre,
      tempo: tempo,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate song: ${response.statusText}`);
  }

  return response.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get job status: ${response.statusText}`);
  }

  return response.json();
}

export function getAudioUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}
