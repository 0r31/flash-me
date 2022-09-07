const information = document.getElementById('info')
if(information) information.innerText = `Cette application utilise Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), et Electron (v${versions.electron()})`

const refresh = document.getElementById('refresh')
const ports = document.getElementById('ports')

function addOption(value, label) {
  let text = document.createTextNode(label)
  let option = document.createElement('option')
  option.setAttribute('value', value)
  option.appendChild(text)
  ports.appendChild(option)
}

async function getSerialPorts() {
  const serialPorts = await window.serial.getSerialPorts()
  console.log(serialPorts)
  ports.replaceChildren([])
  if(serialPorts.length > 0) {
    serialPorts.forEach(port => {
      addOption(port.path, port.path)
    })
  } else {
    addOption('none', 'No ports available')
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  getSerialPorts();
});

refresh.addEventListener('click', async () => {
  getSerialPorts();
})
