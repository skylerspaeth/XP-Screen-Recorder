// Grab elements
const
  videoElement = document.querySelector('video'),
	container = document.querySelector('.container'),
  cancelBtn = document.querySelector('#cancel'),
	videoSelectBtn = document.querySelector('#videoSelectBtn'),
  startBtn = document.querySelector('#startBtn'),
  stopBtn = document.querySelector('#stopBtn')
;

// Electron modules
const
	{ desktopCapturer, remote } = require('electron'),
	{ Menu, dialog } = remote,
	{ writeFile } = require('fs')
;

// Button event handlers
videoSelectBtn.onclick = getSources;
cancelBtn.onclick = cancel;
stopBtn.onclick = e => {
	mediaRecorder.stop();
	startBtn.classList.remove('btn-danger');
	startBtn.innerHTML = 'Record&nbsp;&nbsp;🎥';
	cancel();
}
startBtn.onclick = e => {
	mediaRecorder.start();
	startBtn.classList.add('btn-danger');
	startBtn.innerHTML = 'Recording';
	stopBtn.style.display = 'inline';
};

async function getSources() {
	const inputSources = await desktopCapturer.getSources({
		types: ['window','screen']
	});
	const videoOptionsMenu = Menu.buildFromTemplate(
		inputSources.map(source => {
			return {
				label: `${source.display_id ? '🖥️' : 'Window:'} ${source.name}`,
				click: () => selectSource(source)
			}
		})
	);
	videoOptionsMenu.popup();
}

let mediaRecorder;
const recordedChunks = [];

async function selectSource(source) {
	videoSelectBtn.innerText = source.name;

	// Define constraints for stream object
	const constraints = {
		audio: false,
		video:  {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId: source.id
			}
		}
	};

	// Create a stream object in DOM
	const stream = await navigator.mediaDevices.getUserMedia(constraints);
	videoElement.srcObject = stream;
	container.style.display = 'block';
	cancelBtn.style.display = 'inline';
	videoElement.play();

	// Record media
	const options = { mimeType: 'video/webm; codecs=vp9' };
	mediaRecorder = new MediaRecorder(stream);

	// Listen for user control events
	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.onstop = handleStop;
}

// Capture chunks
function handleDataAvailable(e) {
	console.log('video data being written to array');
	recordedChunks.push(e.data);
}

async function handleStop(e) {
	// Note to self: a blob is a *data structure* to handle raw data, such as the video file
	const blob = new Blob(recordedChunks, {
		type: 'video/webm; codecs=vp9'
	});
	const buffer = Buffer.from(await blob.arrayBuffer());
	const { filePath } = await dialog.showSaveDialog({
		buttonLabel: 'Save video',
		defaultPath: `XP Rec Output ${Date.now()}.webm`
	});
	console.log(`outputting to path ${filePath}`);
	writeFile(filePath, buffer, () => console.log('saving successful'));
}

function cancel() {
	container.style.display = 'none';
	cancelBtn.style.display = 'none';
}
