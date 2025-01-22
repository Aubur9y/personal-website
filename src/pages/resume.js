import { useRouter } from 'next/router';
import Head from 'next/head';
import { connectToDatabase } from '../lib/db';

export default function Resume({ resumePath }) {
  const router = useRouter();

  if (!resumePath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">简历未找到</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>我的简历 | 个人网站</title>
      </Head>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            src={`${resumePath}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-screen"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      return {
        props: { resumePath: null },
        revalidate: 60
      };
    }

    const resumeInfo = await db.collection('settings').findOne({ key: 'resume' });
    
    return {
      props: {
        resumePath: resumeInfo?.path || null
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error fetching resume:', error);
    return {
      props: { resumePath: null },
      revalidate: 60
    };
  }
} 