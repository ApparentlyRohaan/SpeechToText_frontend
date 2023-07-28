import React, { useEffect, useState, useRef } from "react";

const AudioRecorder = () => {

const wsRef = useRef(null)

const mediaRecorder = useRef(null)
const chunks = useRef([]);
const [recording, setRecording] = useState(false);
const [audioChunks, setAudioChunks] = useState([]);
const audioPiece = useRef(0)


const HilightRegion = (para, start, end, isRed, idz) => {

    var pNode = document.getElementById('cert-editor').childNodes[para];
    var currentNode = pNode.childNodes[0]
    var initialLen = currentNode.textContent.length

    var i = 1;
    while(end > initialLen && pNode.childNodes[i])
    {
        currentNode = pNode.childNodes[i]
        
        initialLen += currentNode.textContent.length    
        i++
    }

    var text = currentNode.textContent
    var textNodeStart = document.createTextNode(text.substring(0, start - (initialLen -text.length)))
    var textNodeEnd = document.createTextNode(text.substring(end - (initialLen -text.length), text.length))
    var spanNode = document.createElement("SPAN")
    spanNode.id = idz
    // spanNode.addEventListener("click", SpanClick)
    spanNode.textContent = text.substring(start - (initialLen -text.length), end - (initialLen -text.length))

    if(isRed)
    {
        spanNode.style.borderBottom = "3px solid #ff99ab"
    }
    else 
    {
        spanNode.style.borderBottom = "3px solid rgba(0,161,255,.57)"
    }


    currentNode.replaceWith(textNodeStart)
    textNodeStart.parentNode.insertBefore(spanNode, textNodeStart.nextSibling)
    spanNode.parentNode.insertBefore(textNodeEnd, spanNode.nextSibling)

}

    const startRecording = () => {

        navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            
            mediaRecorder.current = new MediaRecorder(stream);

            //Record chunks of upto 10 seconds
            mediaRecorder.current.start(10000);


            mediaRecorder.current.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                  chunks.current.push(event.data);
                  sendAudio();
                  console.log("chunks.current", chunks.current)
                }
            });

            mediaRecorder.current.addEventListener('stop', () => {
                // const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
                // setAudiochunks.current([...audiochunks.current, audioBlob]);
                    sendAudio();
                    console.log("Audio Stopped", chunks.current)
                  
            });

            setRecording(true);
            // mediaRecorder.current.start();
            console.log("new Media recorder")
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err);
        });
    };

    const stopRecording = () => {
      if(mediaRecorder.current != null) {

        const audioChunkInfo = {
            userId: "16842",
            audiochunk: -1
        }

        // sendJson(audioChunkInfo)

        mediaRecorder.current.stop();
        console.log("Media Stopped")
        setRecording(false);
      }
    };

    const sendAudioChunks = () => {

        const audioBlob = new Blob(chunks.current, { type: 'audio/ogg'});

        chunks.current.forEach((chunk) => {
         

            const audioChunkInfo = {
                userId: "16842",
                audiochunk: audioPiece.current
            }
            audioPiece.current+=1;

            sendJson(audioChunkInfo)

            wsRef.current.send(audioBlob)
        });

        chunks.current = [];
        console.log("setAudioChunks []")
    };

    const sendAudio = () => {

        setTimeout(function() {
            if(recording) {
                console.log('Hello My Infinite Loop Execution');
                sendAudioChunks();
                sendAudio();
            }
        }, 10000);
    }

    const sendJson = (jsonData) => {

      // Convert JSON object to string
      const jsonString = JSON.stringify(jsonData);

      // Send the JSON string as a message
      wsRef.current.send(jsonString);

    }

    const connect = () => {
        console.log("connect called")
        wsRef.current = new WebSocket("ws://localhost:8000/ws");

        // let this = this; // cache the this
        var connectInterval;

        // websocket onopen event listener
        wsRef.current.onopen = () => {
            console.log("connected websocket main component");


            const userInfo = {
                userId: "16842",
                audiochunk: 0
            }
            sendJson(userInfo)

            // this.timeout = 250; // reset timer to 250 on open of websocket connection 
            // clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        // websocket onclose event listener
        wsRef.current.onclose = e => {
            // console.log(
            //     `Socket is closed. Reconnect will be attempted in ${Math.min(
            //         10000 / 1000,
            //         (this.timeout + this.timeout) / 1000
            //     )} second.`,
            //     e.reason
            // );

            // this.timeout = this.timeout + this.timeout; //increment retry interval
            // connectInterval = setTimeout(this.check, Math.min(10000, this.timeout)); //call check function after timeout
        };

        // websocket onerror event listener
        wsRef.current.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            wsRef.current.close();
        };

        // Websocket to handle messages recieved from the server
        wsRef.current.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
            const messageData = JSON.parse(event.data)
            if(Array.isArray(messageData)){
                // setErrorWords(messageData)

                for (let i = 0; i < messageData.length; i++) {
                    console.log(messageData[i]);
                    HilightRegion(0,messageData[i][0], messageData[i][1], true, messageData[i][0]+"-"+messageData[i][1])
                }                

            }
          });

        // Clean up the WebSocket connection on component unmount
        return () => {
          wsRef.current.close();
        };
    };


useEffect(() => {
//     console.log("useEffect called")

    
    //Openign the ws connection
    connect();
},[])
    
    return (
        <div>
            <h1>People Love to comment on the self-made businessman. The person who has come up the hard way. </h1>
          <button onClick={()=>startRecording()}>Start Recording</button>
          <button onClick={()=>stopRecording()}>Stop Recording</button>

          <div id="cert-editor" className="cert-editor" spellCheck="false" suppressContentEditableWarning={true}>
            {/* <p>&nbsp;</p> */}
            <p>People Love to comment on the self-made businessman. The person who has come up the hard way. </p>
        </div>
        </div>
    );
};

export default AudioRecorder;

