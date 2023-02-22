'use client'

import {Link} from '@chakra-ui/next-js'
import {Heading, VStack, Box} from '@chakra-ui/react'

export default function Home() {
  return (
    <main>
      <Heading>Tinydice</Heading>
      <Box py='5' />
      <VStack spacing='24' align='flex-start'>
        <Link
          href='/distribution'
          color='blue.400'
          _hover={{color: 'blue.500'}}>
          Distribution
        </Link>
      </VStack>
    </main>
  )
}
