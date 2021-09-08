// app.js -- Wires

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const colours = [
  '#19b5fe', // blue
  '#ff6347', // red
  '#2ecc91', // green
  '#be90d4' // purple
]

const wireThickness = 20 // pixels
const halfWireThickness = Math.floor(wireThickness / 2)
const wireButtLength = 50 // pixels
const numWires = colours.length
const spaceBetweenWires = canvas.height / (numWires + 1)
const yOffset = spaceBetweenWires - halfWireThickness

const state = {
  randomizedColours: [...colours],
  connections: {}, // key-value pair, where key is left colour index, and value is right colour index
  mouse: {
    isDown: false,
    x: undefined,
    y: undefined,
    clickX: undefined,
    clickY: undefined
  },
  clickedMouseWireButtIndex: undefined
}

const getWireY = (idx) => idx * spaceBetweenWires + yOffset

const initGame = () => {
  // randomize colours
  // a primitive way is to randomize the array using the sort function by
  // returning random values between -1, 0 and +1:
  // here a random number is generated between between 0 and 3 (0, 1, or 2)
  // then subtract one to get (-1, 0, or +1)
  state.randomizedColours = [...colours]
  for (let i = 0; i < Math.floor(Math.random() * 1000); i++) {
    state.randomizedColours.sort(() => Math.floor(Math.random() * 3) - 1)
  }

  // reset the connections state to have no connections
  state.connections = {}
}

let prevMouseState = {...state.mouse}
const update = (tick) => {
  const mouseClicked = (
    prevMouseState.isDown === false
    && state.mouse.isDown === true
    && state.mouse.clickX !== undefined
    && state.mouse.clickY !== undefined
  )
  if (mouseClicked) {
    // see if the click position is on a left wire butt
    // by looking at each wire and comparing the coordinates used for drawing
    const { clickX: mouseX, clickY: mouseY } = state.mouse
    for (let idx = 0; idx < colours.length; idx++) {
      const wireButtLeft = 0
      const wireButtTop = getWireY(idx)
      const wireButtRight = wireButtLeft + wireButtLength
      const wireButtBottom = wireButtTop + wireThickness

      const mouseClickedWireButt = (
        (mouseX >= wireButtLeft && mouseX <= wireButtRight) &&
        (mouseY >= wireButtTop && mouseY <= wireButtBottom)
      )

      if (mouseClickedWireButt) {
        state.clickedMouseWireButtIndex = idx
      }
    }
  }

  // Check to see if the mouse button went from being held down to not pressed
  const mouseLetGo = (
    prevMouseState.isDown === true
    && state.mouse.isDown === false
    && state.clickedMouseWireButtIndex !== undefined
  )
  if (mouseLetGo) {
    const { x: mouseX, y: mouseY } = state.mouse
    for (let idx = 0; idx < colours.length; idx++) {
      // see if the mouse button was let go on top of a wire end-point
      const wireButtLeft = canvas.width - wireButtLength
      const wireButtTop = getWireY(idx)
      const wireButtRight = wireButtLeft + wireButtLength
      const wireButtBottom = wireButtTop + wireThickness

      const mouseLetGoOnWireButt = (
        (mouseX >= wireButtLeft && mouseX <= wireButtRight) &&
        (mouseY >= wireButtTop && mouseY <= wireButtBottom)
      )

      if (mouseLetGoOnWireButt) {
        state.connections[state.clickedMouseWireButtIndex] = idx
        state.clickedMouseWireButtIndex = undefined
      }
    }
  }

  prevMouseState = {...state.mouse}
}

const draw = (tick) => {
  // clear background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // draw wire connections
  Object.keys(state.connections)
    .forEach(leftIndex => {
      const rightIndex = state.connections[leftIndex]
      ctx.strokeStyle = colours[leftIndex]
      ctx.beginPath()
      ctx.moveTo(wireButtLength, getWireY(leftIndex) + halfWireThickness)
      ctx.lineTo(canvas.width - wireButtLength, getWireY(rightIndex) + halfWireThickness)
      ctx.stroke()
    })

  // draw left wire butts
  colours.forEach((colour, idx) => {
    ctx.fillStyle = colour
    ctx.fillRect(0, getWireY(idx), wireButtLength, wireThickness)
  })

  // draw right wire butts
  state.randomizedColours.forEach((colour, idx) => {
    ctx.fillStyle = colour
    ctx.fillRect(canvas.width - wireButtLength, getWireY(idx), wireButtLength, wireThickness)
  })

  // draw currently dragged wire
  ctx.lineCap = "round";
  ctx.lineWidth = wireThickness
  if (state.mouse.isDown && state.clickedMouseWireButtIndex !== undefined) {
    // draw a line from click position and current position
    ctx.strokeStyle = colours[state.clickedMouseWireButtIndex]
    ctx.beginPath()
    ctx.moveTo(wireButtLength, getWireY(state.clickedMouseWireButtIndex) + halfWireThickness)
    ctx.lineTo(state.mouse.x, state.mouse.y)
    ctx.stroke()
  }

  // draw debug text
  /*
  ctx.font = '20px Arial'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'top'
  ctx.fillText(`clickedMouseWireButtIndex: ${state.clickedMouseWireButtIndex}`, 20, 20)
  */
}

const loop = (tick) => {
  update(tick)
  draw(tick)
  requestAnimationFrame(loop)
}

const init = () => {
  console.log('Wires!')
  
  // setup mouse event handlers
  canvas.addEventListener('mouseleave', () => {
    Object.assign(state.mouse, { x: undefined, y: undefined })
  })
  canvas.addEventListener('mousemove', ({ offsetX: x, offsetY: y }) => {
    Object.assign(state.mouse, { x, y })
  })
  canvas.addEventListener('mousedown', ({ offsetX: x, offsetY: y }) => {
    Object.assign(state.mouse, {
      isDown: true,
      clickX: state.mouse.clickX === undefined ? x : state.mouse.clickX,
      clickY: state.mouse.clickY === undefined ? y : state.mouse.clickY
    })
  })
  canvas.addEventListener('mouseup', () => {
    Object.assign(state.mouse, {
      isDown: false,
      clickX: undefined,
      clickY: undefined
    })
  })

  initGame()

  requestAnimationFrame(loop)
}
init()
