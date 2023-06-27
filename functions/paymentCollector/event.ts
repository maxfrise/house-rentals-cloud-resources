type Body = {
  pk: string
  sk: string
  details: string
}

export type Event = {
  environment: string
  body: Body
}