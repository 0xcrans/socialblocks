import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Social } from '@builddao/near-social-js';
import ReactMarkdown from 'react-markdown';
import { fetchTimeByBlockHeight } from '@/utils/timeFormat';
import Link from 'next/link';

const ACCOUNT_ID = 'crans.near';

const SinglePostHeader = ({ accountId, timestamp, blockHeight }) => (
  <div className="post-header">
    <div className="post-info">
      <span className="account-id">{accountId}</span>
      <span className="post-date">{timestamp}</span>
    </div>
    {blockHeight && <ShareButton blockHeight={blockHeight} />}
  </div>
);

const SinglePost = () => {
  const router = useRouter();
  const { blockHeight } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const socialClient = new Social({
    contractId: 'social.near',
    network: 'mainnet',
    networkId: 'mainnet',
    nodeUrl: 'https://free.rpc.fastnear.com'
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!blockHeight) return;
      
      try {
        setLoading(true);
        
        const result = await socialClient.get({
          keys: [`${ACCOUNT_ID}/post/main`],
          blockHeight: parseInt(blockHeight)
        });

        if (!result || !result[ACCOUNT_ID]?.post?.main) {
          setError('Post not found');
          return;
        }

        try {
          const postContent = result[ACCOUNT_ID]?.post?.main;
          const parsedContent = JSON.parse(postContent);
          const time = await fetchTimeByBlockHeight(Number(blockHeight));

          setPost({
            id: blockHeight,
            accountId: ACCOUNT_ID,
            content: parsedContent.text,
            blockHeight: blockHeight,
            imageIPFSHash: parsedContent.image?.ipfs_cid || null,
            timestamp: time
          });
        } catch (e) {
          console.error('Error parsing post:', e);
          setError('Failed to process the post');
        }
      } catch (err) {
        setError(err.message || 'Error parsing post');
      } finally {
        setLoading(false);
      }
    };

    if (blockHeight) {
      fetchPost();
    }
  }, [blockHeight]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto p-8">
          <div className="text-center py-6">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-2 text-pink-500"></p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto p-8">
          <div className="text-red-500 text-center p-4">{error}</div>
          <div className="text-center mt-4">
            <Link href="/" className="back-button">
              ← Back to main page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto p-8">
          <div className="text-red-500 text-center p-4">Post does not exist</div>
          <div className="text-center mt-4">
            <Link href="/" className="back-button">
              ← Back to main page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto p-8">
        <div className="header">
          <h1 className="title">Social Block</h1>
          <div className="flex justify-between items-center">
            <Link href="/" className="back-button">
              ← Back to Blocks
            </Link>
            
          </div>
        </div>
        
        <div className="post-container">
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
          
          <div className="text-sm text-gray-500 mt-4">
            Block: {post.blockHeight}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePost; 
