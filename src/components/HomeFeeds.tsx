import { useState, useMemo } from "react";
import { useTranslation } from "next-i18next";

import { useAtom } from "jotai";
import {
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

import { LONG_FORM, HIGHLIGHT, DAY } from "@habla/const";
import { pubkeyAtom, followsAtom } from "@habla/state";
import SectionHeading from "@habla/components/SectionHeading";
import Tabs from "@habla/components/Tabs";
import Relays from "@habla/components/Relays";
import FeedPage from "@habla/components/nostr/feed/FeedPage";

enum Feeds {
  All = "All",
  Follows = "Follows",
  Language = "Language"
}

export default function HomeFeeds() {
  // todo: list feed
  const { t, i18n } = useTranslation("common");
  const [feed, setFeed] = useState(Feeds.All);
  const [follows] = useAtom(followsAtom);
  const [pubkey] = useAtom(pubkeyAtom);
  const isLoggedIn = pubkey && follows.length > 0;
  const languageLabel = `${t("language")} (${i18n.language})`;
  const feedSelector = (
    <Flex justifyContent="flex-end" width="100%">
      <Menu isLazy>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
          {feed === Feeds.All ? t("all") : (feed === Feeds.Language ? languageLabel : t("follows"))}
        </MenuButton>
        <MenuList fontFamily="'Inter'">
          <MenuItem onClick={() => setFeed(Feeds.All)}>{t("all")}</MenuItem>
          <MenuItem
            isDisabled={!isLoggedIn}
            onClick={() => setFeed(Feeds.Follows)}
          >
            {t("follows")}
          </MenuItem>
          <MenuItem onClick={() => setFeed(Feeds.Language)}>{languageLabel}</MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
  const tabs = [
    {
      name: t("articles"),
      panel: (
        <>
          {feedSelector}
          {feed === Feeds.Follows &&
            <FeedPage
              key={`posts-${pubkey}`}
              filter={{ kinds: [LONG_FORM], authors: follows }}
              offset={2 * DAY}
            />
          }
          {feed === Feeds.Language &&
            <FeedPage filter={{ kinds: [LONG_FORM] }} offset={2 * DAY} options={{language: i18n.language}} />
          }
          {feed === Feeds.All &&
            <FeedPage filter={{ kinds: [LONG_FORM] }} offset={DAY} />
          }
        </>
      ),
    },
    {
      name: t("highlights"),
      panel: (
        <>
          {feedSelector}
          {feed === Feeds.Follows ? (
            <FeedPage
              key={`highlights-${pubkey}`}
              filter={{ kinds: [HIGHLIGHT], authors: follows }}
              offset={2 * DAY}
            />
          ) : (
            <FeedPage filter={{ kinds: [HIGHLIGHT] }} offset={DAY} />
          )}
        </>
      ),
    },
  ];
  return (
    <Tabs
      key={feed === Feeds.Follows ? "user-feed" : "global-feed"}
      tabs={tabs}
    />
  );
}
