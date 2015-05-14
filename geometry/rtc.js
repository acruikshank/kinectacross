var peerConnection;
var channel;

document.getElementById('call').onclick = call;
document.getElementById('kinect').onclick = function() {
  var ws = new WebSocket('ws://localhost:9000');
  ws.binaryType = 'arraybuffer';
  ws.onmessage = function(message) {
    sendData(message.data);
    drawMyImageData(message.data);
  }
}

window.addEventListener('storage', onTabCommunication);

function call() {
  var servers = null;
  peerConnection = window.localPeerConnection =
    new webkitRTCPeerConnection(servers, {
      optional: []
    });
  console.log('Created local peer connection object localPeerConnection');

  // Reliable Data Channels not yet supported in Chrome
  channel = peerConnection.createDataChannel('sendDataChannel', {
    reliable: false
  });
  console.log('Created send data channel');

  peerConnection.onicecandidate = gotIceCandidate;
  channel.onmessage = handleMessage;
  channel.onopen = handleChannelStateChange;
  channel.onclose = handleChannelStateChange;

  peerConnection.createOffer(gotLocalDescription);
  document.body.setAttribute('class','connecting');

  function gotLocalDescription(desc) {
    peerConnection.setLocalDescription(desc);
    console.log('Offer from localPeerConnection \n' + desc.sdp);
    localStorage.setItem("callersdp", JSON.stringify(desc) );
  }
}

function answer(desc) {
  var servers = null;
  peerConnection = window.remotePeerConnection =
    new webkitRTCPeerConnection(
      servers, {
        optional: []
      }
    );
  console.log('Created remote peer connection object remotePeerConnection');

  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.ondatachannel = gotReceiveChannel;

  peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(desc)));
  peerConnection.createAnswer(gotRemoteDescription);

  function gotRemoteDescription(desc) {
    peerConnection.setLocalDescription(desc);
    console.log('Answer from remotePeerConnection \n' + desc.sdp);
    localStorage.setItem("calleesdp", JSON.stringify(desc) );
  }

  function gotReceiveChannel(event) {
    console.log('Receive Channel Callback');
    channel = event.channel;
    channel.onmessage = handleMessage;
    channel.onopen = handleChannelStateChange;
    channel.onclose = handleChannelStateChange;
  }
}

function onTabCommunication(e) {
  if (e.key === 'callersdp')
    answer(e.newValue);
  if (e.key === 'calleesdp')
    onRemoteDescription(e.newValue);
  if (e.key === 'icecandidate')
    onRemoteIce(e.newValue);
}

function sendData(data) {
  channel.send(data);
}

function handleMessage(event) {
  drawImageData(event.data);
}


function onRemoteDescription(desc) {
  console.log('Description from remote', desc);
  peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(desc)));
}

function gotIceCandidate(event) {
  console.log('local ice callback');
  if (event.candidate) {
    localStorage.setItem('icecandidate', JSON.stringify(event.candidate));
    console.log('Local ICE candidate: \n' + event.candidate.candidate);
  }
}

function onRemoteIce(candidate) {
  console.log('remote ice callback');
  peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
}


function handleChannelStateChange() {
  var readyState = channel.readyState;
  console.log('Send channel state is: ' + readyState);
  if (readyState === 'open') {
    document.body.setAttribute('class','connected');
  } else {
    document.body.setAttribute('class','closed');
  }
}
