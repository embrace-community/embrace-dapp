import { Client, DecodedMessage } from "@xmtp/xmtp-js";
import { Signer } from "ethers";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setXmtpClient } from "../store/slices/core";
import { RootState } from "../store/store";
import useSigner from "./useSigner";

function useXmtp() {
  const coreStore = useAppSelector((state: RootState) => state.core);
  const dispatch = useAppDispatch();
  const { signer } = useSigner();
  const xmtpClient = coreStore.xmtpClient;

  const auth = async () => {
    try {
      if (!signer) {
        console.log("no signer");
      }

      const xmtp = await Client.create(signer as Signer);

      dispatch(setXmtpClient(xmtp));
      return xmtp;
    } catch (error) {
      console.error("XMTP: auth() ", error);
    }
  };

  const sendGroupMessage = async (
    recipients: string[],
    message: string,
    conversationId: string,
    metadata: any | null = {},
  ) => {
    if (!xmtpClient || !signer) return;

    try {
      const currentAddress = xmtpClient.address;

      // Have to send the message to all members in the space
      for (const recipient of recipients) {
        // If the member is the current account, then the conversationId needs to differ
        // This way we can allow the user to send messages to themselves, then show their sent messages on the UI
        // Instead of showing every message they have sent to each user (duplicated messages)
        const msgConversationId =
          recipient.toLowerCase() === currentAddress.toLowerCase()
            ? `${conversationId}/${currentAddress}`
            : conversationId;

        const result = sendMessage(
          recipient,
          message,
          msgConversationId!,
          metadata,
        );

        if (result) {
          console.log("result", result);
        } else {
          console.log("can't message ", recipient);
        }
      }
    } catch (error) {
      console.error("XMTP: sendGroupMessage() ", error);
    }
  };

  const sendMessage = async (
    recipient: string,
    message: string,
    conversationId: string,
    metadata: any | null,
  ) => {
    if (!xmtpClient || !signer) return;

    try {
      // Check the account has used XMTP before
      const canMessage = await xmtpClient.canMessage(recipient);

      if (canMessage) {
        // Send the message if we can
        const conversation = await xmtpClient.conversations.newConversation(
          recipient,
          {
            conversationId,
            metadata: metadata,
          },
        );

        return await conversation.send(message);
      }
    } catch (error) {
      console.error("XMTP: sendMessage() ", error);
    }
  };

  // Specifically for a chat app group
  // TODO: If a new member joins they won't be able to see the messages sent before they joined
  const getGroupMessages = async (
    conversationId: string,
    receivedMessagesAfterDate: Date | null = null,
  ) => {
    if (!xmtpClient) return;

    try {
      // Get all the conversations for account
      const allConversations = await xmtpClient.conversations.list();

      // Filter the conversations to only get the ones for this space's chat
      const appConversations = allConversations.filter(
        (convo) =>
          convo.context?.conversationId &&
          convo.context?.conversationId.startsWith(conversationId),
      );

      if (appConversations.length > 0) {
        const currentAddress = xmtpClient.address;
        let opts = {};

        if (receivedMessagesAfterDate) {
          console.log("receivedMessagesAfterDate", receivedMessagesAfterDate);
          opts = {
            startTime: receivedMessagesAfterDate,
            endTime: new Date(),
          };
        }

        // Merge messages from each conversation
        const messages: DecodedMessage[] = [].concat.apply(
          [],
          await Promise.all(
            appConversations.map(async (convo) => {
              let conversationMsgs: DecodedMessage[];
              // My messages to the group (which I essentially sent to myself)
              if (
                !receivedMessagesAfterDate &&
                convo.context?.conversationId ===
                  `${conversationId}/${currentAddress}`
              ) {
                conversationMsgs = await convo.messages(opts);
              } else {
                // Messages sent from anyone in the group to me
                conversationMsgs = (await convo.messages(opts)).filter(
                  (message: DecodedMessage) =>
                    message.senderAddress !== currentAddress,
                );
              }

              return conversationMsgs as any;
            }),
          ),
        );

        console.log("messages", messages);

        // sort messages by order of being sent
        const chatMessages = messages
          .filter((message) => {
            return message;
          })
          .sort(
            (a: DecodedMessage, b: DecodedMessage) =>
              a.sent?.getTime() - b.sent?.getTime(),
          );

        return chatMessages;
      } else {
        return [];
      }
    } catch (error) {
      console.error("XMTP: getGroupMessages() ", error);
    }
  };

  return { auth, sendGroupMessage, getGroupMessages };
}

export default useXmtp;
