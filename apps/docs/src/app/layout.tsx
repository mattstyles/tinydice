'use client'

import {CacheProvider} from '@chakra-ui/next-js'
import {ChakraProvider, Box} from '@chakra-ui/react'

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang='en'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <CacheProvider>
          <ChakraProvider>
            <Box px='8' py='3'>
              {children}
            </Box>
          </ChakraProvider>
        </CacheProvider>
      </body>
    </html>
  )
}
