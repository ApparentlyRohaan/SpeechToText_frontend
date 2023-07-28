import React, { useEffect, useState, useRef } from "react";

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioPiece = useRef(0)

  useEffect(() => {
    console.log("useEffect called")
    let mediaRecorder;
    let chunks = [];

    const startRecording = () => {
      chunks = [];
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          console.log("new Media recorder")
          mediaRecorder = new MediaRecorder(stream);
          // mediaRecorder.ondataavailable = (e) => {
          //   if (e.data.size > 0) {
          //     chunks.push(e.data);
          //     console.log("chunks", chunks)
          //   }
          // };

          mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
              console.log("chunks", chunks)
            }
          });

          mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            setAudioChunks([...audioChunks, audioBlob]);
          });

          mediaRecorder.start();
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err);
        });
    };

    const stopRecording = () => {
      if(mediaRecorder != null) {
        mediaRecorder.stop();
        setRecording(false);
      //   const blob = new Blob(chunks, { type: "audio/webm"});
      //   console.log("blob", blob)
      //   setAudioChunks([...audioChunks, blob]);
      }
    };

    const sendAudioChunks = () => {
      audioChunks.forEach((chunk) => {
        const formData = new FormData();
        console.log("chunk", chunk)
        formData.append("audio", chunk, "recording"+audioPiece.current+".webm");
        audioPiece.current+=1;

          fetch("http://localhost:8000/backend-upload-audio", {
            method: "POST",
            body: formData,
          })
          // .then((response) => response.json())
          .then((data) => {
            console.log("Audio chunk sent successfully:", data);
            handleStartRecording();
          })
          .catch((error) => {
            console.error("Error sending audio chunk:", error);
          });
      });

      setAudioChunks([]);
      console.log("setAudioChunks")
    };

    console.log("recording", recording)
    if (recording) {
      startRecording();
      const timer = setTimeout(stopRecording, 5000); // Record for 5 seconds

      // return () => {
      //   clearTimeout(timer);
      //   stopRecording();
      // };
    } else if (audioChunks.length > 0) {
      sendAudioChunks();
    }
  }, [recording, audioChunks]);

  const handleStartRecording = () => {
    setRecording(true);
  };

  return (
    <div>
      <button onClick={() => handleStartRecording()} disabled={recording}>
        Start Recording
      </button>
      {audioChunks.length > 0 && (
        <div>
          <h3>Recorded Chunks:</h3>
          {audioChunks.map((chunk, index) => (
            <div key={index}>
              <audio controls src={URL.createObjectURL(chunk)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
