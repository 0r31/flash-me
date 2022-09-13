const fileButton = document.getElementById('firmware')
const fileName = document.getElementById('fileName')
const refresh = document.getElementById('refresh')
const ports = document.getElementById('ports')
const flash = document.getElementById('flash')
const reset = document.getElementById('reset')
const message = document.getElementById('message')

var port = 'none'
var filePath = ''

function addOption(value, label) {
  let text = document.createTextNode(label)
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

async function openMe() {
  const firmware = await window.flashMeAPI.open()
  filePath = firmware.filePath
  fileName.innerText = firmware.fileName
}

async function listMe() {
  const serialPorts = await flashMeAPI.list()
  ports.replaceChildren([])
  if(serialPorts.length > 0) {
    serialPorts.forEach(port => {
      addOption(port.path, port.path)
    })
  } else {
    addOption('none', 'No ports available')
  }
}

async function flashMe() {
  const port = ports.value
  if(port === 'none') {
    message.innerText = 'No port available!'
    return
  }
  if(filePath === '') {
    message.innerText = 'No firmware available!'
    return
  }

  message.innerText = 'Flashing...'
  toggle()
  flashMeAPI.flash(port, filePath).then((result) => {
    toggle()
    message.innerText = result
  }).catch((error) => {
    toggle()
    message.innerText = error
  })
}

async function resetMe() {
  const port = ports.value
  if(port === 'none') {
    message.innerText = 'No port available!'
    return
  }
  message.innerText = 'Resetting EEPROM...'
  toggle()
  await flashMeAPI.reset(port).then((result) => {
    toggle()
    message.innerText = result
  }).catch((error) => {
    toggle()
    message.innerText = error
  })
}

document.addEventListener('DOMContentLoaded', listMe)
fileButton.addEventListener('click', openMe)
refresh.addEventListener('click', listMe)
flash.addEventListener('click', flashMe)
reset.addEventListener('click', resetMe)
