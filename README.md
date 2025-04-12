# HistoryRag 拉个史

这是一个人工智能史料查询工具。用户可以本地部署，上传史料，然后问关于史料的问题。

## 本地部署条件
1. 需要有一个本地或者远程PostgreSQL。
2. 需要有一个OpenAI的API key。

## 第一次本地部署
`./install.sh`

安装过程中，请依次输入你的PostgreSQL URL和OpenAI API key

## 本地运行
`pnpm run dev`

## 常见问题
### 怎么看数据库的数据？
`pnpm db:studio`

## 本地部署

- [Next.js](https://nextjs.org) 14 (App Router)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenAI](https://openai.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Postgres](https://www.postgresql.org/) with [ pgvector ](https://github.com/pgvector/pgvector)
- [shadcn-ui](https://ui.shadcn.com) and [TailwindCSS](https://tailwindcss.com) for styling
