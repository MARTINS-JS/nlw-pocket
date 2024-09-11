const { select, input, checkbox } = require('@inquirer/prompts')
const fs = require('fs').promises

console.log('')

let message = 'Welcome to the goals app!'
let goals

const requestGoals = async () => {
  try {
    const db = await fs.readFile('goals.json', 'utf-8')
    goals = JSON.parse(db)
  } catch (err) {
    goals = []
  }
}

const saveGoals = async () => {
  await fs.writeFile('goals.json', JSON.stringify(goals, null, 2))
}

const registerGoal = async () => {
  const goal = await input({
    message: 'Write the goal:'
  })

  if (goal.length == 0) {
    console.log('The goal was not written.')
    return
  }

  goals.push({ value: goal, checked: false })

  message = 'Goal registered successfully.'
}

const listGoals = async () => {
  if(goals.length == 0) {
    message = 'There are no goals to list.'
    return
  }

  const answers = await checkbox({
    message: 'Press (space) to select, (arrows) to toggle all, (i) to invert selection, and (enter) to proceed.',
    choices: [...goals],
    instructions: false
  })

  goals.forEach((goal) => {
    goal.checked = false
  })

  if(answers.length == 0) {
    message = 'No target selected.'
    return
  }

  answers.forEach((answer) => {
    const goal = goals.find((goal) => {
      return goal.value == answer
    })

    goal.checked = true
  })

  message = 'Goals completed!'
}

const completedGoals = async () => {
  if(goals.length == 0) {
    message = 'There are no goals to list.'
    return
  }

  const completed = goals.filter((goal) => {
    return goal.checked
  })

  if(completed.length == 0) {
    message = 'There are no completed goals.'
    return
  }

  await select({
    message: 'Completed goals: ' + completed.length,
    choices: [...completed]
  })
}

const openGoals = async () => {
  if(goals.length == 0) {
    message = 'There are no goals to list.'
    return
  }

  const open = goals.filter((goal) => {
    return goal.checked != true
  })

  if(open.length == 0) {
    message = 'There are no goals to open.'
    return
  }

  await select({
    message: 'Goals Open: ' + open.length,
    choices: [...open]
  })
}

const deleteGoals = async () => {
  if(goals.length == 0) {
    message = 'There are no goals to list.'
    return
  }

  const unselectedGoals = goals.map((goal) => {
    return { value: goal.value, checked: false }
  })

  const goalsToDelete = await checkbox({
    message: 'Select the goals to delete.',
    choices: [...unselectedGoals],
    instructions: false
  })

  if(goalsToDelete.length == 0) {
    message = 'There are no deleted goals.'
    return
  }

  goalsToDelete.forEach((goalDeleted) => {
    goals = goals.filter((goal) => {
      return goal.value != goalDeleted 
    })
  })

  message = 'Goal deleted successfully!'
}

const showMessage = () => {
  console.clear()

  if(message != '') {
    console.log('')
    console.log(message)
    console.log('')
    message = ''
  }
} 

const start = async () => {
  await requestGoals()

  while(true) {
    showMessage()
    await saveGoals()

    const option = await select({
      message: 'Menu:',
      choices: [
        {
          name: 'Register',
          value: 'register' 
        },
        {
          name: 'List',
          value: 'list' 
        },
        {
          name: 'Completed',
          value: 'completed' 
        },
        {
          name: 'Open',
          value: 'open' 
        },
        {
          name: 'Deleted',
          value: 'deleted' 
        },
        {
          name: 'Exit',
          value: 'exit' 
        }
      ]
    })

    switch(option) {
      case 'register':
        await registerGoal()
        break
      case 'list':
        await listGoals()
        break
      case 'completed':
        await completedGoals()
        break
      case 'open':
        await openGoals()
        break
      case 'deleted':
        await deleteGoals()
        break
      case 'exit':
        console.log('See you next time!')
        return
    }
  }
}

start()