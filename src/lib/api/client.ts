import { API_BASE_URL } from './constants';
import {
  GenerateSongRequest,
  GenerateSongResponse,
  JobStatusResponse,
  HistorySong,
  DeleteSongResponse,
  PianoTilesChart,
} from './types';

const MOOD_TO_TEMPO: Record<string, string> = {
  joyful: 'upbeat',
  peaceful: 'slow',
  nostalgic: 'moderate',
  hopeful: 'moderate',
  grateful: 'moderate',
  loving: 'slow',
};

export async function generateSong(data: GenerateSongRequest): Promise<GenerateSongResponse> {
  // Only include tempo if mood is provided
  const tempo = data.mood ? (MOOD_TO_TEMPO[data.mood.toLowerCase()] || 'moderate') : undefined;

  // Build request body with only provided fields
  const requestBody: { prompt: string; genre?: string; tempo?: string } = {
    prompt: data.prompt,
  };

  if (data.genre) {
    requestBody.genre = data.genre;
  }

  if (tempo) {
    requestBody.tempo = tempo;
  }

  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
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

export async function getHistory(): Promise<HistorySong[]> {
  const response = await fetch(`${API_BASE_URL}/api/history`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch history: ${response.statusText}`);
  }

  const data: Array<HistorySong & { word_timings?: HistorySong['wordTimings'] }> = await response.json();
  // Map audioUrl for each song
  return data.map(song => ({
    ...song,
    wordTimings: song.wordTimings ?? song.word_timings ?? undefined,
    audioUrl: `${API_BASE_URL}/api/audio/${song.job_id}`
  }));
}

export async function deleteSong(id: string): Promise<DeleteSongResponse> {
  const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete song: ${response.statusText}`);
  }

  return response.json();
}

export async function getPianoTilesChart(jobId: string): Promise<PianoTilesChart> {
  const response = await fetch(`${API_BASE_URL}/api/piano-tiles/${jobId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch chart: ${response.statusText}`);
  }

  const chart: PianoTilesChart = await response.json();
  return {
    ...chart,
    audioUrl: getAudioUrl(chart.audioUrl),
  };
}

export async function transcribeAudio(audio: Blob): Promise<{ text: string }> {
  const contentType = audio.type || 'audio/webm';
  const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: audio,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to transcribe audio: ${response.statusText}`);
  }

  return response.json();
}

export function getAudioUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}
