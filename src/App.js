import React from 'react';
import VideoChat from './components/VideoChat';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Video Call</h1>
        <VideoChat />
      </div>
    </div>
  );
}

export default App;