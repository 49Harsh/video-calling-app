import React, { useState } from 'react';

const JoinForm = ({ onJoin }) => {
  const [channel, setChannel] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (channel.trim()) {
      onJoin(channel);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
            Channel Name
          </label>
          <input
            type="text"
            id="channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter channel name"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Join Call
        </button>
      </form>
    </div>
  );
};

export default JoinForm;