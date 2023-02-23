'use client'

import {useState, useMemo, useCallback} from 'react'
import {
  AspectRatio,
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Input,
  Container,
} from '@chakra-ui/react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from 'recharts'
import {d} from 'tinydice'

function generateSample(
  fn: () => number,
  n: number = 1e5
): Map<number, number> {
  const sample = new Map<number, number>()
  let idx = n
  while (--idx >= 0) {
    let result = fn()
    sample.set(result, (sample.get(result) ?? 0) + 1)
  }
  for (let [key, value] of sample.entries()) {
    sample.set(key, value / n)
  }
  return sample
}

type SampleFn = () => number
type Sample = Map<number, number>
type Samples = Map<string, Sample>
type ChartData = Array<{
  num: string
  [key: string]: number | string
}>
type ChartKeys = Array<string>

export default function DistributionChart() {
  const [samples, setSamples] = useState<Samples>(new Map())
  const [sampleKeys, setSampleKey] = useState<ChartKeys>([])
  const addNewSample = useCallback(
    (id: string, fn: SampleFn) => {
      if (samples.has(id)) {
        console.log(id, 'is already in the data set')
        return
      }
      const sample = generateSample(fn)
      setSamples(new Map(samples.set(id, sample)))
    },
    [samples, setSamples]
  )

  const data = useMemo<ChartData>(() => {
    const dataMap = new Map()
    samples.forEach((sample, id) => {
      setSampleKey(() => {
        return [...sampleKeys, id]
      })
      sample.forEach((value, key) => {
        const datum = dataMap.get(key) ?? {num: key}
        dataMap.set(key, {...datum, [id]: value})
      })
    })

    // Convert to array from data map
    const data: ChartData = []
    dataMap.forEach((v, k) => {
      data[k] = v
    })

    // data is likely sparse so filter out
    return data.filter((x) => x != null)
  }, [samples])

  return (
    <Box>
      <VStack>
        <Heading>Distribution chart</Heading>
        <AddNewSample addNewSample={addNewSample} />
        <Container>
          <AspectRatio maxW='100%' ratio={4 / 3}>
            <Chart data={data} keys={sampleKeys} />
          </AspectRatio>
        </Container>
      </VStack>
    </Box>
  )
}

function AddNewSample({
  addNewSample,
}: {
  addNewSample: (id: string, fn: SampleFn) => void
}) {
  const [value, setValue] = useState<string>('')
  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    return setValue(event.currentTarget.value)
  }
  const onClick = useCallback(() => {
    // @TODO we could definitely do this earlier and disable the button
    try {
      d(value)
    } catch (err) {
      console.error('Invalid dice string')
      return
    }

    addNewSample(value, () => d(value))
    setValue('')
  }, [addNewSample, value])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onClick()
      }}>
      <HStack>
        <Input
          value={value}
          onChange={handleChange}
          placeholder='Dice string'
        />
        <Button onClick={onClick}>Add</Button>
      </HStack>
    </form>
  )
}

let idx = 0
const colors = [
  '#FD0E35',
  '#FE6F5E',
  '#FF7034',
  '#FBE7B2',
  '#AFE313',
  '#9DE093',
  '#00CCCC',
  '#02A4D3',
  '#766EC8',
  '#FC74FD',
]
function getNextColor(): string {
  idx = idx + 1
  if ((idx = colors.length)) {
    idx = 0
  }
  return colors[idx]
}

function Chart({data, keys}: {data: ChartData; keys: ChartKeys}) {
  if (!data.length || !keys.length) {
    return null
  }
  return (
    <ResponsiveContainer>
      <AreaChart
        data={data}
        margin={{top: 20, right: 20, left: 20, bottom: 20}}>
        <CartesianGrid strokeDasharray='.1 .1' />
        <XAxis dataKey='num' />
        <YAxis />
        <Legend />
        <Tooltip />
        {keys.map((key, idx) => {
          return (
            <Area
              key={key}
              isAnimationActive={false}
              type='monotone'
              dataKey={key}
              stroke={colors[idx % colors.length]}
              fill={colors[idx % colors.length]}
            />
          )
        })}
      </AreaChart>
    </ResponsiveContainer>
  )
}
