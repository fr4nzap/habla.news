import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";

import { decodeNevent } from "@habla/nostr";
import { useEvent } from "@habla/nostr/hooks";
import Layout from "@habla/layouts/Wide";

const NEvent = dynamic(() => import("@habla/components/nostr/NEvent"), {
  ssr: false,
});

export default function Nevent({ metadata }) {
  const router = useRouter();
  const { nevent } = router.query;
  const { id, author, relays } = decodeNevent(nevent) ?? {};
  const { title, summary, image } = metadata ?? {
    title: "Habla",
    summary: "Speak your mind",
  };
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="og:title" content={title} />
        <meta property="og:type" content="article" />
        <meta name="og:description" content={summary} />
        {image && <meta name="og:image" content={image} />}
      </Head>
      <Layout>
        {id && (
          <NEvent nevent={nevent} id={id} author={author} relays={relays} />
        )}
      </Layout>
    </>
  );
}
