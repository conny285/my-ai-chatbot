import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

export const runtime = 'edge'
const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages: histories } = json
  const question = histories[histories.length - 1]['content']

  const messages = [{
    'role': 'system',
    'content': '你現在扮演生物學專家'
  }, ...histories.slice(-3, -1), {
    'role': 'user',
    'content': `用戶輸入：${question}請用最專業且客氣的口吻來呈現`
  }]

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-16k',
    messages,
    temperature: 0.5,
    stream: true
  })

  const stream = OpenAIStream(res)

  return new StreamingTextResponse(stream)
}
