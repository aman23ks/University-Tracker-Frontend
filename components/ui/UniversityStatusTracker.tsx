import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

interface UniversityProgress {
  processed_urls: number;
  total_urls: number;
  data_chunks: number;
  status: string;
}

interface UniversityStatus {
  id: string;
  name: string;
  url: string;
  status: string;
  progress?: UniversityProgress;
  error?: string;
}

interface Props {
  universities: { id: string; name: string; url: string }[];
  onComplete?: (id: string) => void;
}

export function UniversityStatusTracker({ universities, onComplete }: Props) {
  const [statuses, setStatuses] = useState<Record<string, UniversityStatus>>({});
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  const fetchStatus = async (university: typeof universities[0]) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/universities/${university.id}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      
      // Reset retry count on successful fetch
      setRetryCount(prev => ({ ...prev, [university.id]: 0 }));
      
      return {
        id: university.id,
        name: university.name,
        url: university.url,
        status: data.status,
        progress: {
          processed_urls: parseInt(data.progress?.processed_urls || '0'),
          total_urls: parseInt(data.progress?.total_urls || '0'),
          data_chunks: parseInt(data.progress?.data_chunks || '0'),
          status: data.status
        },
        error: data.error
      };
    } catch (error) {
      console.error(`Error fetching status for ${university.name}:`, error);
      
      // Increment retry count
      setRetryCount(prev => ({
        ...prev,
        [university.id]: (prev[university.id] || 0) + 1
      }));
      
      return null;
    }
  };

  useEffect(() => {
    if (universities.length === 0) return;

    const updateStatuses = async () => {
      const newStatuses = { ...statuses };
      let hasChanges = false;

      for (const university of universities) {
        // Skip if we've had too many consecutive failures
        if (retryCount[university.id] > 10) {
          console.log(`Skipping ${university.name} due to too many failures`);
          continue;
        }

        const status = await fetchStatus(university);
        if (status) {
          hasChanges = true;
          newStatuses[university.id] = status;

          // Check if processing is complete or failed
          if (
            (status.status === 'completed' || status.status === 'failed') &&
            statuses[university.id]?.status !== status.status
          ) {
            onComplete?.(university.id);
          }
        }
      }

      if (hasChanges) {
        setStatuses(newStatuses);
      }
    };

    // Initial update
    updateStatuses();

    // Set up polling
    const interval = setInterval(updateStatuses, 3000);
    return () => clearInterval(interval);
  }, [universities, onComplete, retryCount]);

  const getProgressPercentage = (status: UniversityStatus) => {
    const progress = status?.progress;
    if (!progress?.total_urls) return 0;
    return Math.round((progress.processed_urls / progress.total_urls) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'processing':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {universities.map((university) => {
        const status = statuses[university.id];
        const progress = status?.progress;
        const percentage = getProgressPercentage(status);
        const statusColor = getStatusColor(status?.status || 'initializing');

        return (
          <div key={university.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="font-medium">{university.name}</div>
              <div className={`text-sm ${statusColor}`}>
                {status?.status || 'Initializing...'}
              </div>
            </div>
            
            <Progress 
              value={percentage} 
              className="h-2"
            />
            
            <div className="text-sm text-gray-500 flex justify-between">
              <span>
                Pages: {progress?.processed_urls || 0}/{progress?.total_urls || 0}
              </span>
              <span>Data Chunks: {progress?.data_chunks || 0}</span>
            </div>
            
            {status?.error && (
              <div className="text-sm text-red-500 mt-1">
                Error: {status.error}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}