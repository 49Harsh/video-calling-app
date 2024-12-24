import { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const appId = '809b73c2abfe452e853f59e9c6b375c2';

function VideoCall({ channelName, client, onLeave }) {
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    let tracks = [];

    const init = async () => {
      try {
        if (client.connectionState === 'CONNECTED') {
          await client.leave();
        }

        tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        if (!mounted) return;
        
        setLocalTracks(tracks);
        const [audioTrack, videoTrack] = tracks;

        const uid = Math.floor(Math.random() * 1000000);
        await client.join(appId, channelName, null, uid);
        
        if (!mounted) return;
        setIsJoined(true);

        if (videoTrack) {
          videoTrack.play('local-video');
        }
        
        await client.publish([audioTrack, videoTrack]);

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          
          if (mediaType === 'video') {
            user.videoTrack?.play(`remote-video-${user.uid}`);
            setRemoteUsers(prev => ({
              ...prev,
              [user.uid]: user
            }));
          }
          
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        client.on('user-left', (user) => {
          setRemoteUsers(prev => {
            const newUsers = { ...prev };
            delete newUsers[user.uid];
            return newUsers;
          });
        });

      } catch (error) {
        if (mounted) {
          setError(`Failed to join: ${error.message}`);
          await cleanup();
        }
      }
    };

    const cleanup = async () => {
      for (let track of tracks) {
        track?.stop();
        track?.close();
      }
      
      if (client.connectionState === 'CONNECTED') {
        await client.unpublish(tracks).catch(console.error);
        await client.leave().catch(console.error);
      }
      
      if (mounted) {
        setRemoteUsers({});
        setLocalTracks([]);
        setIsJoined(false);
      }
    };

    init();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [channelName, client]);

  const handleLeave = async () => {
    try {
      for (let track of localTracks) {
        track?.stop();
        track?.close();
      }
      
      if (client.connectionState === 'CONNECTED') {
        await client.unpublish(localTracks);
        await client.leave();
      }
      
      setLocalTracks([]);
      setRemoteUsers({});
      onLeave();
    } catch (err) {
      setError(`Failed to leave: ${err.message}`);
    }
  };

  return (
    <div className="grid gap-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
          <div id="local-video" className="w-full h-full"></div>
          <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded">
            You
          </div>
        </div>
        
        {Object.values(remoteUsers).map((user) => (
          <div key={user.uid} className="bg-black rounded-lg aspect-video relative overflow-hidden">
            <div id={`remote-video-${user.uid}`} className="w-full h-full"></div>
            <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded">
              Remote User ({user.uid})
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleLeave}
        disabled={!isJoined}
        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
      >
        Leave
      </button>
    </div>
  );
}

export default VideoCall;