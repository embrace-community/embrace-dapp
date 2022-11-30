import { Client, DecodedMessage } from "@xmtp/xmtp-js";
import { Signer } from "ethers";
import { useSigner } from "wagmi";

function useXmtp() {
  const { data: signer } = useSigner();

  const auth = async () => {
    try {
      if (!signer) {
        console.log("no signer");
      }

      const xmtp = await Client.create(signer as Signer);

      // setXmtpClient(xmtp);
      return xmtp;
    } catch (error) {
      console.error(error);
    }
  };

  const sendGroupMessage = async (
    xmtpClient: Client,
    recipients: string[],
    message: string,
    conversationId: string,
    metadata: any | null = {},
  ) => {
    if (!xmtpClient || !signer) return;

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
        xmtpClient,
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
  };

  const sendMessage = async (
    xmtpClient: Client,
    recipient: string,
    message: string,
    conversationId: string,
    metadata: any | null,
  ) => {
    if (!xmtpClient || !signer) return;

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
  };

  // Specifically for a chat app group
  const getGroupMessages = async (
    xmtpClient: Client,
    conversationId: string,
    messagesAfterDate: Date | null = null,
  ) => {
    if (!xmtpClient) return;

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

      if (messagesAfterDate) {
        console.log("messagesAfterDate", messagesAfterDate);
        opts = {
          startTime: messagesAfterDate,
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
  };

  return { auth, sendGroupMessage, getGroupMessages };
}

export default useXmtp;
