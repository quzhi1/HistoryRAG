import { FileUpload } from '@/components/FileUpload';
import { Chat } from '@/components/Chat';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          HistoryRag 拉个史 史料查询助手
        </h1>
        <div className="mb-8">
          <FileUpload />
        </div>
        <Chat />
      </div>
    </main>
  );
}