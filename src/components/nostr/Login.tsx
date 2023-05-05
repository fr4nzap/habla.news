import { useEffect, useMemo } from "react";
import Link from "next/link";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { useAtom } from "jotai";
import { nip19 } from "nostr-tools";

import { Avatar, Flex, Button, Text, Icon, Stack } from "@chakra-ui/react";
import WriteIcon from "@habla/icons/Write";
import { useNdk, useUser } from "@habla/nostr/hooks";

import { userAtom, relaysAtom, pubkeyAtom, followsAtom } from "@habla/state";

function ProfileLink({ profile, pubkey, relays }) {
  const nprofile = useMemo(() => {
    if (pubkey) {
      return nip19.nprofileEncode({
        pubkey,
        relays,
      });
    }
  }, [pubkey, relays]);

  return (
    <Link href={`/p/${nprofile}`}>
      <Flex gap="2" ml="auto">
        <Avatar
          name={profile?.name || pubkey}
          size="md"
          src={profile?.picture || profile?.image}
        />
      </Flex>
    </Link>
  );
}

export default function Login() {
  const ndk = useNdk();
  const [relays, setRelays] = useAtom(relaysAtom);
  const [pubkey, setPubkey] = useAtom(pubkeyAtom);
  const profile = useUser(pubkey);
  const [, setFollows] = useAtom(followsAtom);

  function loginWithExtension() {
    try {
      window.nostr.getPublicKey().then((pk) => {
        setPubkey(pk);
        const user = new NDKUser({ hexpubkey: pk });
        user.ndk = ndk;
        // User profile
        user.fetchProfile();
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (pubkey) {
      // Follows & Relays
      ndk
        .fetchEvent({
          kinds: [3],
          authors: [pubkey],
        })
        .then((contactList) => {
          const follows = contactList.tags
            .filter((t) => t.at(0) === "p")
            .map((t) => t.at(1));
          setFollows(follows);
          const relays = JSON.parse(contactList.content);
          setRelays(Object.keys(relays));
        });
    }
  }, [pubkey]);

  return pubkey ? (
    <Stack align="center" direction="row" spacing={2}>
      <Link href="/write">
        <Button
          variant="write"
          aria-label="Write"
          leftIcon={<Icon as={WriteIcon} boxSize={5} />}
        >
          Write
        </Button>
      </Link>
      <ProfileLink profile={profile} pubkey={pubkey} relays={relays} />
    </Stack>
  ) : (
    <Button colorScheme="orange" onClick={loginWithExtension}>
      Log in
    </Button>
  );
}
