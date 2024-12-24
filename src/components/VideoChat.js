import React, { useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import VideoCall from './VideoCall';

const appId = 'YOUR_AGORA_APP_ID'; // Replace with your Agora app ID
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

function VideoChat() {
  const [inCall, setInCall] = useState(false);
  const [channelName, setChannelName] = useState('');
  
  return (
    <div>
      {!inCall ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <input
            type="text"
            placeholder="Enter channel name"
            className="w-full p-2 mb-4 border rounded"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
          <button
            onClick={() => setInCall(true)}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={!channelName}
          >
            Join Call
          </button>
        </div>
      ) : (
        <VideoCall
          channelName={channelName}
          client={client}
          onLeave={() => setInCall(false)}
        />
      )}
    </div>
  );
}

export default VideoChat;