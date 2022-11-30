import { Client, DecodedMessage } from "@xmtp/xmtp-js";
import { Signer } from "ethers";

import { useEffect, useState } from "react";
import { useSigner } from "wagmi";

export default function ChatMessenger({ handle }) {
  const { data: signer } = useSigner();
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const spaceConversationId = `embrace.community/${handle}/chat`;

  const members = [
    "0xCa8454AFbC91cFfe20E726725beB264AE5Bb52FC",
    "0x725Acc62323480E9565fBbfAC8573908e4EEF883",
    "0xB64A31a65701f01a1e63844216f3DbbCC9b3cF2C",
  ]; // Need to get from contract

  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [messageText, setMessageText] = useState<string>("");

  useEffect(() => {
    if (!signer) return;

    const startChatMessenger = async () => {
      try {
        if (!signer) {
          console.log("no signer");
        }

        const xmtp = await Client.create(signer as Signer);

        setXmtpClient(xmtp);
      } catch (error) {
        console.error(error);
      }
    };

    startChatMessenger();
  }, [signer]);

  const sendMessage = async () => {
    if (!xmtpClient || !signer) return;

    const currentAddress = xmtpClient.address;

    // Have to send the message to all members in the space
    for (const member of members) {
      let conversationId = spaceConversationId;

      // If the member is the current account, then the conversationId needs to differ
      // This way we can allow the user to send messages to themselves, then show their sent messages on the UI
      // Instead of showing every message they have sent to each user (duplicated messages)
      if (member.toLowerCase() === (currentAddress as string).toLowerCase()) {
        conversationId = `${spaceConversationId}/${currentAddress}`;
      }

      // Check the account has used XMTP before
      const canMessage = await xmtpClient.canMessage(member);

      if (canMessage) {
        // Send the message if we can
        const conversation = await xmtpClient.conversations.newConversation(
          member,
          {
            conversationId,
            metadata: {
              space: handle,
            },
          },
        );

        const result = await conversation.send(messageText);
        console.log("result", result);
      } else {
        console.log("can't message ", member);
      }
    }
  };

  useEffect(() => {
    if (!xmtpClient) return;

    const getMessages = async () => {
      if (!xmtpClient) return;

      // Get all the conversations for account
      const allConversations = await xmtpClient.conversations.list();

      // Filter the conversations to only get the ones for this space's chat
      const appConversations = allConversations.filter(
        (convo) =>
          convo.context?.conversationId &&
          convo.context?.conversationId.startsWith(spaceConversationId),
      );

      if (appConversations.length > 0) {
        const currentAddress = xmtpClient.address;
        console.log(appConversations, "appConversations");

        // Merge messages from each conversation
        const messages: DecodedMessage[] = [].concat.apply(
          [],
          await Promise.all(
            appConversations.map(async (convo) => {
              let conversationMsgs: DecodedMessage[];
              // My messages to the group (which I essentially sent to myself)
              if (
                convo.context?.conversationId ===
                `${spaceConversationId}/${currentAddress}`
              ) {
                conversationMsgs = await convo.messages();
              } else {
                // Messages sent from anyone in the group to me
                conversationMsgs = (await convo.messages()).filter(
                  (message: DecodedMessage) =>
                    message.senderAddress !== currentAddress,
                );
              }

              return conversationMsgs as any;
            }),
          ),
        );

        console.log(messages, "messages");

        // sort messages by order of being sent
        const chatMessages = messages
          .filter((message) => {
            return message;
          })
          .sort(
            (a: DecodedMessage, b: DecodedMessage) =>
              a.sent?.getTime() - b.sent?.getTime(),
          );

        console.log(chatMessages, "messages");
        setMessages(chatMessages);
      }
    };

    getMessages();
  }, [spaceConversationId, xmtpClient]);

  return (
    <div>
      {xmtpClient &&
        messages.length > 0 &&
        messages.map((message) => (
          <div key={message.id} className="mt-5">
            <p>Sender: {message.senderAddress}</p>
            <p>{message.content}</p>
          </div>
        ))}

      <br></br>
      {xmtpClient && (
        <>
          <input
            type="text"
            id="message"
            onKeyUp={(e) => setMessageText(e.currentTarget.value)}
          />
          <button onClick={() => sendMessage()}>Send message</button>
        </>
      )}
    </div>
  );
}
