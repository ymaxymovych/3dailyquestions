
import React, { useState, useEffect } from 'react';
import { Mic, X, Loader2, Sparkles, StopCircle } from 'lucide-react';
import { DailyReportState } from '../types';

interface VoiceInputProps {
  onReportGenerated: (partialState: Partial<DailyReportState>) => void;
}

// --- MOCK AI PARSER ---
// In a real app, this would be an API call to OpenAI Whisper + GPT-4
const parseVoiceToState = (text: string): Partial<DailyReportState> => {
  console.log("Parsing voice input:", text);
  
  // Simulated parsing logic based on keywords
  return {
    yesterday: {
      plannedTasks: [
        { id: 'v1', title: 'Finished UI Design', type: 'Medium', status: 'done', timeEstimate: '2h' },
        { id: 'v2', title: 'Client Sync', type: 'Medium', status: 'partial', comment: 'Client was late' }
      ],
      unplannedWork: 'Helped junior dev with layout bug (30m)',
      smallTasks: 'Answered Slack messages',
      summary: 'Productive day, visual part is mostly done.',
      metrics: 'Screens designed: 5'
    },
    today: {
      bigTask: 'Mobile Responsiveness',
      bigTaskTime: '10:00-14:00',
      isBigTaskBooked: true,
      mediumTasks: 'Fix navigation menu (1h)\nUpdate footer styles (45m)',
      smallTasks: 'Code review',
      expectedMetrics: 'Pages responsive: 3'
    },
    help: {
      blockers: 'Still waiting for access to the new repo.'
    }
  };
};

export const VoiceInput: React.FC<VoiceInputProps> = ({ onReportGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  // Timer for recording UI
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStart = () => {
    setIsOpen(true);
    setIsRecording(true);
    // Simulate recording start
  };

  const handleStop = () => {
    setIsRecording(false);
    setIsProcessing(true);

    // Simulate AI Latency
    setTimeout(() => {
      // Mock transcript that "happened"
      const mockTranscript = "Вчора я закінчив дизайн інтерфейсу і мав дзвінок з клієнтом, але він запізнився. Також допоміг джуну з багом. Сьогодні план - зробити мобільну адаптивність, це головне завдання до обіду. Також пофікшу меню і футер. Блокер - досі чекаю доступ до репозиторію.";
      setTranscript(mockTranscript);
      
      setTimeout(() => {
        const parsedState = parseVoiceToState(mockTranscript);
        onReportGenerated(parsedState);
        setIsProcessing(false);
        setIsOpen(false);
        setTranscript('');
      }, 1500); // Parsing time
    }, 1000); // Finalizing audio time
  };

  const handleClose = () => {
    if (isProcessing) return;
    setIsOpen(false);
    setIsRecording(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleStart}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 group"
        title="Заповнити голосом"
      >
        <Mic className="w-6 h-6 group-hover:animate-pulse" />
        <span className="hidden md:block font-bold pr-2">Voice Input</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            AI Voice Assistant
          </h3>
          <button onClick={handleClose} disabled={isProcessing} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center justify-center text-center">
          
          {isProcessing ? (
            <div className="space-y-4">
               <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-600 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
               </div>
               <div>
                 <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Analyzing...</h4>
                 <p className="text-sm text-slate-500">Structuring your report</p>
               </div>
            </div>
          ) : (
            <div className="space-y-6 w-full">
               <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 bg-red-500/30 rounded-full animate-pulse"></div>
                  <div className="relative z-10 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                     <Mic className="w-8 h-8 text-white" />
                  </div>
               </div>
               
               <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Listening...</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Говоріть вільно про вчорашній день, плани та проблеми.
                  </p>
               </div>

               {/* Waveform Visualization (CSS Animation) */}
               <div className="h-8 flex items-center justify-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-1 bg-slate-400 dark:bg-slate-600 rounded-full animate-[bounce_1s_infinite]" style={{ height: Math.random() * 20 + 10 + 'px', animationDelay: `${i * 0.1}s` }}></div>
                  ))}
               </div>

               <div className="font-mono text-2xl font-bold text-slate-700 dark:text-slate-300">
                  {formatTime(recordingTime)}
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isProcessing && (
           <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
              <button 
                onClick={handleStop}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95"
              >
                <StopCircle className="w-5 h-5" />
                Finish & Process
              </button>
           </div>
        )}
      </div>
    </div>
  );
};
