// pages/index.js
import Head from 'next/head';
import SocialFeed from '../components/SocialFeed';

export default function Home() {
 return (
   <div>
     <Head>
       <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
       <title>Social Blocks</title>
     </Head>
     <SocialFeed />
   </div>
 );
}
