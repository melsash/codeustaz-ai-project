import React, { useState } from 'react';
import { BrainCircuit, Play, BarChart3, Loader2 } from 'lucide-react';

export default function AIPanel() {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [trainingMsg, setTrainingMsg] = useState<string>('');
  const [plotUrl, setPlotUrl] = useState<string>('');
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isPlotting, setIsPlotting] = useState(false);

  // 1. Модельді оқыту (Train the model)
  const handleTrain = async () => {
    setIsTraining(true);
    setTrainingMsg('Оқытылуда... (Training in progress...)');
    try {
      const res = await fetch('http://localhost:8000/train', { method: 'POST' });
      const data = await res.json();
      setTrainingMsg(`Оқыту аяқталды! Соңғы қателік (Final Loss): ${data.final_loss.toFixed(4)}`);
    } catch (error) {
      setTrainingMsg('Қате шықты. Python серверінің қосылғанын тексеріңіз. (Error. Check if Python server is running.)');
    } finally {
      setIsTraining(false);
    }
  };

  // 2. Болжам жасау (Make a prediction)
  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      // 10 кездейсоқ сан жібереміз (Send 10 random features)
      const features = Array.from({ length: 10 }, () => Math.random());
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
      });
      const data = await res.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Python серверімен байланыс жоқ (No connection to Python server).');
    } finally {
      setIsPredicting(false);
    }
  };

  // 3. Графикті алу (Fetch the plot)
  const handlePlot = () => {
    setIsPlotting(true);
    // Кэштеліп қалмау үшін уақытты қосамыз (Add timestamp to prevent caching)
    setPlotUrl(`http://localhost:8000/plot?t=${new Date().getTime()}`);
    setTimeout(() => setIsPlotting(false), 500); // Simulate loading state
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI & Deep Learning (PyTorch)</h2>
          <p className="text-sm text-gray-500">FastAPI арқылы Python серверімен байланыс (Connection to Python server via FastAPI)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Train Section */}
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-500" />
            1. Модельді оқыту
          </h3>
          <p className="text-xs text-gray-500 mb-4 flex-1">
            PyTorch арқылы нейрондық желіні оқытады (Trains the neural network using PyTorch).
          </p>
          <button 
            onClick={handleTrain} 
            disabled={isTraining}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isTraining ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isTraining ? 'Оқытылуда...' : 'Оқытуды бастау (Train)'}
          </button>
          {trainingMsg && (
            <div className="mt-3 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 font-medium">
              {trainingMsg}
            </div>
          )}
        </div>

        {/* Predict Section */}
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-emerald-500" />
            2. Болжам жасау
          </h3>
          <p className="text-xs text-gray-500 mb-4 flex-1">
            Оқытылған модель арқылы жаңа деректерге болжам жасайды (Makes a prediction using the trained model).
          </p>
          <button 
            onClick={handlePredict} 
            disabled={isPredicting}
            className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isPredicting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isPredicting ? 'Есептелуде...' : 'Болжау (Predict)'}
          </button>
          {prediction !== null && (
            <div className="mt-3 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100 font-medium">
              Нәтиже (Result): <span className="font-bold">{prediction.toFixed(4)}</span>
            </div>
          )}
        </div>

        {/* Plot Section */}
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            3. Графикті көру
          </h3>
          <p className="text-xs text-gray-500 mb-4 flex-1">
            Matplotlib арқылы салынған графикті FastAPI-дан алады (Fetches a Matplotlib plot from FastAPI).
          </p>
          <button 
            onClick={handlePlot} 
            disabled={isPlotting}
            className="w-full py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isPlotting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isPlotting ? 'Жүктелуде...' : 'Графикті жүктеу (Load Plot)'}
          </button>
        </div>
      </div>

      {/* Plot Image Display */}
      {plotUrl && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-center">
          <img 
            src={plotUrl} 
            alt="Generated Plot from Python" 
            className="rounded-lg shadow-sm max-w-full h-auto"
            onError={() => alert('Суретті жүктеу мүмкін болмады. Python сервері қосылғанын тексеріңіз.')}
          />
        </div>
      )}
    </div>
  );
}
