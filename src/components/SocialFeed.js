import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchTimeByBlockHeight } from '@/utils/timeFormat';

const ACCOUNT_ID = 'crans.near';
const BATCH_SIZE = 1000;

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-6">
    <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="ml-2 text-pink-500">Loading...</p>
  </div>
);

const Header = () => (
  <div className="flex justify-between items-center mb-8 px-4">
    <h1 className="text-2xl md:text-3xl font-bold text-pink-500">
      Wrapped thoughts into Social Blocks
    </h1>
    <button 
      onClick={() => window.location.href = 'https://crans.xyz'} 
      className="text-2xl hover:scale-110 transition-transform"
    >
      🌐
    </button>
  </div>
);

const PostHeader = ({ accountId, timestamp }) => (
  <div className="flex justify-between items-center mb-4 text-gray-400">
    <span className="font-medium">{accountId}</span>
    <span className="text-sm">{timestamp}</span>
  </div>
);

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seenIds] = useState(new Set());

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keys: [`${ACCOUNT_ID}/post/main`],
          options: {
            limit: BATCH_SIZE,
            order: 'desc'
          }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch posts');
      const indexResult = await response.json();

      if (!indexResult?.length) return;

      const postsData = await Promise.all(
        indexResult.map(async (item) => {
          if (seenIds.has(item.blockHeight)) return null;
          seenIds.add(item.blockHeight);

          const result = await fetch('/api/get', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              keys: [`${ACCOUNT_ID}/post/main`],
              blockHeight: item.blockHeight
            })
          }).then(res => res.json());

          try {
            const postContent = result[ACCOUNT_ID]?.post?.main;
            const parsedContent = JSON.parse(postContent);
            const time = await fetchTimeByBlockHeight(Number(item.blockHeight));

            return {
              id: `${item.blockHeight}-${Date.now()}`,
              accountId: ACCOUNT_ID,
              content: parsedContent.text,
              blockHeight: item.blockHeight,
              imageIPFSHash: parsedContent.image?.ipfs_cid || null,
              timestamp: time
            };
          } catch (e) {
            console.error('Error parsing post:', e);
            return null;
          }
        })
      );

      setPosts(postsData.filter(Boolean));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 rounded-lg bg-red-100/10">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Header />
        
        <div className="space-y-6">
          {posts.map(post => (
            <div 
              key={post.id} 
              className="bg-gray-900/80 backdrop-blur rounded-lg p-6 shadow-xl 
                         transform transition-all duration-300 hover:scale-[1.02]
                         border border-gray-800/50"
            >
              <PostHeader accountId={post.accountId} timestamp={post.timestamp} />

              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table {...props} className="min-w-full divide-y divide-gray-700" />
                      </div>
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="text-pink-400 hover:text-pink-300 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ),
                    img: ({ node, ...props }) => (
                      <div className="my-4 rounded-lg overflow-hidden">
                        <img 
                          {...props}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>

                {post.imageIPFSHash && (
                  <div className="mt-6 rounded-lg overflow-hidden">
                    <img
                      src={`https://ipfs.near.social/ipfs/${post.imageIPFSHash}`}
                      alt=""
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && <LoadingSpinner />}
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
