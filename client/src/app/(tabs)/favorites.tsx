import { View, Text } from 'react-native'
import React from 'react'
import Header from '@/components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Favorites() {
  return (
    <SafeAreaView className='flex-1' edges={["top"]}>
      <Header showBack />
    </SafeAreaView>
  )
}