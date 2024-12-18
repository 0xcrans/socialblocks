import React, { useState, useEffect } from 'react';
import { Social } from '@builddao/near-social-js';
import ReactMarkdown from 'react-markdown';
import { fetchTimeByBlockHeight } from '@/utils/timeFormat';


const ACCOUNT_ID = 'crans.near';
const BATCH_SIZE = 1000;

const LoadingSpinner = () => (
  <div className="text-center py-6">
    <div className="loading-spinner mx-auto"></div>
    <p className="mt-2 text-pink-500">Loading...</p>
  </div>
);

const Header = () => (
  <div className="header">
    <h1 className="title">Wrapped thoughts into Social Blocks</h1>
    <button onClick={() => window.location.href = 'https://crans.xyz'} className="root-button">
    🌐
    </button>
  </div>
);

const PostHeader = ({ accountId, timestamp }) => (
  <div className="post-header">
    <span className="account-id">{accountId}</span>
    <span className="timestamp">{timestamp}</span>
  </div>
);

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seenIds] = useState(new Set());

  const socialClient = new Social({
    contractId: 'social.near',
    network: 'mainnet'
  });

  const fetchPosts = async () => {
    try {
      const indexResult = await socialClient.index({
        action: 'post',
        key: 'main',
        limit: BATCH_SIZE,
        accountId: ACCOUNT_ID,
        order: 'desc'
      });

      if (!indexResult?.length) return;

      const postsData = await Promise.all(
        indexResult.map(async (item) => {
          if (seenIds.has(item.blockHeight)) return null;
          seenIds.add(item.blockHeight);

          const result = await socialClient.get({
            keys: [`${ACCOUNT_ID}/post/main`],
            blockHeight: item.blockHeight
          });

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto p-8">
        <Header />
        
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="post-container">
              <PostHeader accountId={post.accountId} timestamp={post.timestamp} />

              <div className="prose">
                <ReactMarkdown
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="table-container">
                        <table {...props} className="markdown-table" />
                      </div>
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ),
                    img: ({ node, ...props }) => (
                      <div className="image-container">
                        <img 
                          {...props}
                          className="post-image"
                          loading="lazy"
                        />
                      </div>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>

                {post.imageIPFSHash && (
                  <div className="image-container">
                    <img
                      src={`https://ipfs.near.social/ipfs/${post.imageIPFSHash}`}
                      alt=""
                      className="post-image"
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
