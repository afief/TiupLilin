var flame;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
realAudioInput = null,
inputPoint = null,
audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;


function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

function updateAnalysers(time) { 
    var SPACING = 3;
    var BAR_WIDTH = 1;
    var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

    analyserNode.getByteFrequencyData(freqByteData); 

    var multiplier = analyserNode.frequencyBinCount;

    var magnitude = 0;

    for (var j = 0; j< multiplier; j++)
        magnitude += freqByteData[j];

    magnitude = magnitude / multiplier;
    

    
    if (magnitude > 100) {
        flame.kill();
        window.setTimeout(liveAgain, 3000);
    } else {
        rafID = window.requestAnimationFrame( updateAnalysers );
    }
    function liveAgain() {
        flame.liveAgain();
        rafID = window.requestAnimationFrame( updateAnalysers );
    }
}

function toggleMono() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = convertToMono( realAudioInput );
    }

    audioInput.connect(inputPoint);
}

function gotStream(stream) {
    inputPoint = audioContext.createGain();


    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    updateAnalysers();
}

function initAudio() {
    flame = new Flame();

    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
    {
        "audio": {
            "mandatory": {
                "googEchoCancellation": "false",
                "googAutoGainControl": "false",
                "googNoiseSuppression": "false",
                "googHighpassFilter": "false"
            },
            "optional": []
        },
    }, gotStream, function(e) {
        alert('Error getting audio');
        console.log(e);
    });
}

window.addEventListener('load', initAudio );