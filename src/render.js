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
	{ Menu } = remote
;

// Button event handlers
videoSelectBtn.onclick = getSources;
cancelBtn.onclick = cancel;

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
	cancelBtn.style.display = 'block';
	videoElement.play();
}

function cancel() {
	container.style.display = 'none';
	cancelBtn.style.display = 'none';
}
