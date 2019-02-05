var canvas = document.querySelector('#cvs-audio-visualization-input');
var canvasCtx = canvas.getContext("2d");

// define audio context
// Webkit/blink browsers need prefix, Safari won't work without window.
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var gainNode = audioCtx.createGain();
var analyser = audioCtx.createAnalyser();

function startPoint() {
    // constraints - only audio needed for this app
    navigator.getUserMedia({ audio: true },

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

var samplingDuration = 1;
var smaplingCnt = 0;
var valueCnt = [];

var WIDTH = 0;
var HEIGHT = 0;

function visualize(stream) {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    var bufferLength = analyser.frequencyBinCount; // half the FFT value
    var dataArray = new Uint8Array(bufferLength); // create an array to store the data
    
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray); // get waveform data and put it into the array created above

        if(smaplingCnt > samplingDuration) {
            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            for (var i = 0; i < analyser.frequencyBinCount; i++) {
                var value = valueCnt[i];
                var percent = value / (256 * samplingDuration); // 256;
                var height = HEIGHT * percent;
                var offset = HEIGHT - height - 1;
                var barWidth = WIDTH / analyser.frequencyBinCount;
                var hue = i / analyser.frequencyBinCount * 360;
                canvasCtx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                canvasCtx.fillRect(i * barWidth, offset, barWidth, height);        
            }

            checkVowel(valueCnt);

            smaplingCnt = 0;
            valueCnt.length = 0;
            valueCnt = [];
            for(var j = 0; j < dataArray.length; j++) {
                valueCnt[j] = 0;
            }
        } else { 
            for (var i = 0; i < analyser.frequencyBinCount; i++) {
                valueCnt[i] += dataArray[i];
            }
        }

        smaplingCnt = smaplingCnt + 1;
    }

    draw();
}

// if you want something more accurate way then edit here!
var btnA, btnI, btnU;

function checkVowel(values) {
    let chkA = false;
    let chkI = false;
    let chkU = false;
    var sum = 0;
    // A
    var sum = 0;
    for(var i = 256; i < 512; i++) {
        sum += values[i];
    }
    if(sum > 2048) chkA = true;
    
    // I 
    var sum = 0;
    for(var i = 128; i < 256; i++) {
        sum += values[i];
    }
    if(sum > 2048) chkI = true;

    // U
    var sum = 0;
    for(var i = 0; i < 128; i++) {
        sum += values[i];
    }
    for(var i = 128; i < 256; i++) {
        sum -= values[i];
    }
    if(sum > 1024) chkU = true;

    // result
    if(chkA) {
        btnA.classList.add('active');        
    } else {
        btnA.classList.remove('active');
    }
    if(chkI) {
        btnI.classList.add('active');        
    } else {
        btnI.classList.remove('active');
    }
    if(chkU) {
        btnU.classList.add('active');        
    } else {
        btnU.classList.remove('active');
    }
}