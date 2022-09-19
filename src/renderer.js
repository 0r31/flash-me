const fileButton = document.getElementById('firmware')
const fileName = document.getElementById('fileName')
const ports = document.getElementById('ports')
const flash = document.getElementById('flash')
const reset = document.getElementById('reset')
const message = document.getElementById('message')

var port = 'none'
var filePath = ''

function addOption(value, label = '') {
  let optionLabel = (label) ? label : value;
  let text = document.createTextNode(optionLabel)
  let option = document.createElement('option')
  option.setAttribute('value', value)
  option.appendChild(text)
  ports.appendChild(option)
}

function toggle() {
  const disabled = flash.disabled
  flash.disabled = !disabled
  reset.disabled = !disabled
}

function setMessage(messageText) {
  toggle()
  message.innerText = messageText
}

async function openMe() {
  const firmware = await flashMeAPI.open()
  filePath = firmware.filePath
  fileName.innerText = firmware.fileName
}

flashMeAPI.list((event, serialports) => {
  let selectedPort = ports.value
  let portPaths = []
  ports.replaceChildren(portPaths)
  if(serialports.length > 0) {

    serialports.forEach(port => {
      let portPath = port.path
      addOption(portPath)
      portPaths.push(portPath)
    })
    if(selectedPort && portPaths.includes(selectedPort)) {
      ports.value = selectedPort
    } else {
      ports.value = serialports[0].path
    }
  } else {
    addOption('none', 'No ports available')
  }
})

async function flashMe() {
  port = ports.value
  if(port === 'none') {
    message.innerText = 'No port available!'
    return
  }
  if(filePath === '') {
    message.innerText = 'No firmware available!'
    return
  }

  setMessage('Flashing...')
  flashMeAPI.flash(port, filePath).then((result) => {
    setMessage(result)
  }).catch((error) => {
    setMessage(error)
  })
}

async function resetMe() {
  port = ports.value
  if(port === 'none') {
    message.innerText = 'No port available!'
    return
  }

  setMessage('Resetting EEPROM...')
  await flashMeAPI.reset(port).then((result) => {
    setMessage(result)
  }).catch((error) => {
    setMessage(error)
  })
}

function handleKeyPress (event) {
  switch(event.key.toLowerCase()) {
    case 'o':
      openMe()
      break
    case 'f':
      flashMe()
      break
    case 'r':
      resetMe()
      break
  }
}

window.addEventListener('keyup', handleKeyPress, true)
fileButton.addEventListener('click', openMe)
flash.addEventListener('click', flashMe)
reset.addEventListener('click', resetMe)
