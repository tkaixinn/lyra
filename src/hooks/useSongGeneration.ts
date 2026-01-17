import { useMutation, useQuery } from '@tanstack/react-query';
import { generateSong, getJobStatus } from '../lib/api/client';
import { GenerateSongRequest, JobStatusResponse } from '../lib/api/types';
import { POLL_INTERVAL_MS } from '../lib/api/constants';

export function useGenerateSong() {
  return useMutation({
    mutationFn: (data: GenerateSongRequest) => generateSong(data),
  });
}

export function useJobStatus(jobId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as JobStatusResponse | undefined;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return POLL_INTERVAL_MS;
    },
    retry: 3,
  });
}
