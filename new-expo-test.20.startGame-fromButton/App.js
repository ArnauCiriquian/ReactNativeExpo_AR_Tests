import { TouchableOpacity, View, Text } from 'react-native'
import Game from './src/pages/Game'
import { useState } from 'react'

export default function App() {
  const [game, setGame] = useState(false)
  const [main, setMain] = useState(true)

  const handleStartGame = event => {
    setMain(false)
    setGame(true)
  }

  const handleFinishGame = event => {
    setMain(true)
    setGame(false)
  }

  if (main) {
    return (<View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <TouchableOpacity onPress={handleStartGame}>
        <Text>Start game!
        </Text>
      </TouchableOpacity>
    </View>)
  }
  if (game) return (<Game />)
}