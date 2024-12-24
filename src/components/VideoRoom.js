
import React, { useState, useEffect, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const VideoRoom = ({ client, channelName, onLeave }) => {
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const AGORA_APP_ID = '809b73c2abfe452e853f59e9c6b375c2';

  const cleanupTracks = useCallback(() => {
    if (localTrack) {
      localTrack[0].close();
      localTrack[1].close();
      setLocalTrack(null);
    }
  }, [localTrack]);

  const handleLeave = useCallback(async () => {
    try {
      cleanupTracks();
      if (client) {
        await client.leave();
      }
      onLeave();
    } catch (err) {
      setError(`Failed to leave call: ${err.message}`);
    }
  }, [client, onLeave, cleanupTracks]);

  useEffect(() => {
    const setupClient = async () => {
      if (!client || isConnecting) return;

      try {
        setIsConnecting(true);
        setError('');

        // Ensure clean state
        cleanupTracks();
        if (client.connectionState === 'CONNECTED') {
          await client.leave();
        }

        // Create and publish tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTrack([audioTrack, videoTrack]);

        await client.join(AGORA_APP_ID, channelName, null);
        await client.publish([audioTrack, videoTrack]);

        // Handle remote users
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video') {
            user.videoTrack?.play(`remote-video-${user.uid}`);
          }
          setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
        });

        client.on('user-unpublished', (user) => {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        });

        // Play local video
        videoTrack.play('local-video');

      } catch (err) {
        setError(`Failed to join call: ${err.message}`);
        cleanupTracks();
      } finally {
        setIsConnecting(false);
      }
    };

    setupClient();

    return () => {
      handleLeave();
    };
  }, [client, channelName, handleLeave, cleanupTracks, isConnecting]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <div id="local-video" className="w-full h-full" />
        </div>

        {remoteUsers.map(user => (
          <div key={user.uid} className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <div id={`remote-video-${user.uid}`} className="w-full h-full" />
          </div>
        ))}
      </div>

      <button
        onClick={handleLeave}
        disabled={isConnecting}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Leave Call'}
      </button>
    </div>
  );
};

export default VideoRoom;