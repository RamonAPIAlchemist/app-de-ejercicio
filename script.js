let device;
let stepsChar;
let distanceChar;
let timeChar;

async function requestDevice() {
  const options = {
    acceptAllDevices: true,
    optionalServices: ['heart_rate'],
  };

  device = await navigator.bluetooth.requestDevice(options);
  device.addEventListener('gattserverdisconnected', connectDevice);
}

async function connectDevice() {
  if (!device || !device.gatt.connected) return;

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService('heart_rate');

  stepsChar = await service.getCharacteristic('steps');
  distanceChar = await service.getCharacteristic('distance');
  timeChar = await service.getCharacteristic('time');

  stepsChar.addEventListener('characteristicvaluechanged', handleStepsChange);
  distanceChar.addEventListener('characteristicvaluechanged', handleDistanceChange);
  timeChar.addEventListener('characteristicvaluechanged', handleTimeChange);

  await startMonitoring();
}

async function startMonitoring() {
  await stepsChar.startNotifications();
  await distanceChar.startNotifications();
  await timeChar.startNotifications();
}

async function stopMonitoring() {
  await stepsChar.stopNotifications();
  await distanceChar.stopNotifications();
  await timeChar.stopNotifications();
}

function handleStepsChange(event) {
  const stepsValue = event.target.value.getUint16(0, true);
  document.getElementById('steps').textContent = stepsValue;
}

function handleDistanceChange(event) {
  const distanceValue = event.target.value.getUint16(0, true) / 1000;
  document.getElementById('distance').textContent = distanceValue.toFixed(2);
}

function handleTimeChange(event) {
  const timeValue = event.target.value.getUint32(0, true);
  const hours = Math.floor(timeValue / 3600);
  const minutes = Math.floor((timeValue % 3600) / 60);
  const seconds = Math.floor(timeValue % 60);
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('time').textContent = formattedTime;
}

document.getElementById('start').addEventListener('click', async () => {
  await requestDevice();
  await connectDevice();
});

document.getElementById('stop').addEventListener('click', stopMonitoring);
