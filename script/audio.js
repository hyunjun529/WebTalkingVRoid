var canvas = document.querySelector('#cvs-audio-visualization-input');
var canvasCtx = canvas.getContext("2d");

 // define audio context
 // Webkit/blink browsers need prefix, Safari won't work without window.
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var gainNode = audioCtx.createGain();
var analyser = audioCtx.createAnalyser();

function startPoint() {
    // constraints - only audio needed for this app
    navigator.getUserMedia( { audio: true },

        // Success callback
        function (stream) {
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioCtx.destination); // connecting the different audio graph nodes together

            visualize(stream);
        },

        // Error callback
        function (err) {
            console.log('The following gUM error occured: ' + err);
        }
    );
}

// 이거를 visualize 할 것
function visualize(stream) {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount; // half the FFT value
    var dataArray = new Uint8Array(bufferLength); // create an array to store the data

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {

        drawVisual = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray); // get waveform data and put it into the array created above

        canvasCtx.fillStyle = 'rgb(200, 200, 200)'; // draw wave with canvas
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0;
            var y = v * HEIGHT / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();

    draw();

    }

}
